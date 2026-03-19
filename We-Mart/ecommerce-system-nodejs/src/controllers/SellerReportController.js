const sellerWalletService = require('../services/SellerWalletService');
const { WalletTransaction, PayoutRequest, Order } = require('../models/mongoose');
const logger = require('../utils/logger');

/**
 * Seller Report Controller
 * Handles seller reporting endpoints
 */
class SellerReportController {
  /**
   * Get earnings report
   */
  async getEarningsReport(req, res) {
    try {
      const sellerId = req.user.id;
      const { start_date, end_date, group_by = 'day' } = req.query;

      // Build date filter
      const dateFilter = {};
      if (start_date) {
        dateFilter.$gte = new Date(start_date);
      }
      if (end_date) {
        dateFilter.$lte = new Date(end_date);
      }

      // Get wallet summary
      const wallet = await sellerWalletService.getWallet(sellerId);

      // Get credit transactions (earnings)
      const creditTransactions = await WalletTransaction.find({
        seller_id: sellerId,
        transaction_type: 'credit',
        ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
      })
        .sort({ created_at: -1 })
        .populate('order_id', 'order_number total_amount status');

      // Calculate earnings by period
      const earningsByPeriod = this.groupByPeriod(creditTransactions, group_by);

      // Get total earnings
      const totalEarnings = creditTransactions.reduce((sum, t) => sum + t.amount, 0);

      // Get earnings by order status
      const earningsByStatus = {
        pending: creditTransactions
          .filter(t => t.metadata?.balance_type === 'pending')
          .reduce((sum, t) => sum + t.amount, 0),
        available: creditTransactions
          .filter(t => t.metadata?.balance_type !== 'pending')
          .reduce((sum, t) => sum + t.amount, 0)
      };

      res.json({
        success: true,
        data: {
          summary: {
            total_earnings: wallet.total_earnings,
            available_balance: wallet.available_balance,
            pending_balance: wallet.pending_balance,
            total_paid: wallet.total_paid
          },
          period_summary: {
            total_earnings: totalEarnings,
            transaction_count: creditTransactions.length,
            earnings_by_period: earningsByPeriod,
            earnings_by_status: earningsByStatus
          },
          recent_transactions: creditTransactions.slice(0, 20)
        }
      });
    } catch (error) {
      logger.error('Get earnings report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get earnings report',
        error: error.message
      });
    }
  }

  /**
   * Get commission breakdown report
   */
  async getCommissionReport(req, res) {
    try {
      const sellerId = req.user.id;
      const { start_date, end_date } = req.query;

      // Build date filter
      const dateFilter = {};
      if (start_date) {
        dateFilter.$gte = new Date(start_date);
      }
      if (end_date) {
        dateFilter.$lte = new Date(end_date);
      }

      // Get orders with commission data
      const orders = await Order.find({
        seller_id: sellerId,
        commission_calculated: true,
        ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
      })
        .sort({ created_at: -1 })
        .select('order_number total_amount seller_earning platform_fee commission net_payout commission_breakdown created_at status');

      // Calculate totals
      const totals = {
        total_orders: orders.length,
        total_order_value: orders.reduce((sum, o) => sum + o.total_amount, 0),
        total_seller_earning: orders.reduce((sum, o) => sum + (o.seller_earning || 0), 0),
        total_platform_fee: orders.reduce((sum, o) => sum + (o.platform_fee || 0), 0),
        total_commission: orders.reduce((sum, o) => sum + (o.commission || 0), 0),
        total_net_payout: orders.reduce((sum, o) => sum + (o.net_payout || 0), 0)
      };

      // Group by commission rule
      const commissionByRule = {};
      orders.forEach(order => {
        if (order.commission_breakdown) {
          order.commission_breakdown.forEach(breakdown => {
            const ruleName = breakdown.rule_name || 'Default';
            if (!commissionByRule[ruleName]) {
              commissionByRule[ruleName] = {
                rule_name: ruleName,
                rule_type: breakdown.rule_type,
                count: 0,
                total_commission: 0
              };
            }
            commissionByRule[ruleName].count++;
            commissionByRule[ruleName].total_commission += breakdown.commission_amount || 0;
          });
        }
      });

      res.json({
        success: true,
        data: {
          summary: totals,
          commission_by_rule: Object.values(commissionByRule),
          orders: orders.slice(0, 50) // Limit to 50 most recent
        }
      });
    } catch (error) {
      logger.error('Get commission report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get commission report',
        error: error.message
      });
    }
  }

  /**
   * Get payout history report
   */
  async getPayoutReport(req, res) {
    try {
      const sellerId = req.user.id;
      const { start_date, end_date, status } = req.query;

      // Build filters
      const filters = { seller_id: sellerId };
      if (status) {
        filters.status = status;
      }

      const dateFilter = {};
      if (start_date) {
        dateFilter.$gte = new Date(start_date);
      }
      if (end_date) {
        dateFilter.$lte = new Date(end_date);
      }
      if (Object.keys(dateFilter).length > 0) {
        filters.created_at = dateFilter;
      }

      // Get payout requests
      const payouts = await PayoutRequest.find(filters)
        .sort({ created_at: -1 });

      // Calculate totals
      const totals = {
        total_requests: payouts.length,
        total_requested: payouts.reduce((sum, p) => sum + p.amount, 0),
        total_paid: payouts
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + (p.fees?.net_amount || p.amount), 0),
        total_pending: payouts
          .filter(p => ['pending', 'validated', 'approved', 'processing'].includes(p.status))
          .reduce((sum, p) => sum + p.amount, 0),
        total_fees: payouts.reduce((sum, p) => sum + (p.fees?.processing_fee || 0), 0)
      };

      // Group by status
      const payoutsByStatus = {};
      payouts.forEach(payout => {
        if (!payoutsByStatus[payout.status]) {
          payoutsByStatus[payout.status] = {
            count: 0,
            total_amount: 0
          };
        }
        payoutsByStatus[payout.status].count++;
        payoutsByStatus[payout.status].total_amount += payout.amount;
      });

      res.json({
        success: true,
        data: {
          summary: totals,
          payouts_by_status: payoutsByStatus,
          payouts: payouts
        }
      });
    } catch (error) {
      logger.error('Get payout report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payout report',
        error: error.message
      });
    }
  }

  /**
   * Helper: Group transactions by period
   */
  groupByPeriod(transactions, groupBy) {
    const grouped = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at);
      let key;

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          count: 0,
          total_amount: 0
        };
      }

      grouped[key].count++;
      grouped[key].total_amount += transaction.amount;
    });

    return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
  }
}

module.exports = new SellerReportController();

