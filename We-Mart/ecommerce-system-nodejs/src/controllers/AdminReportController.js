const { PayoutRequest, WalletTransaction, Order, CommissionRule, SellerWallet } = require('../models/mongoose');
const logger = require('../utils/logger');

/**
 * Admin Report Controller
 * Handles admin reporting and analytics endpoints
 */
class AdminReportController {
  /**
   * Get payout summary
   */
  async getPayoutSummary(req, res) {
    try {
      const { start_date, end_date, status } = req.query;

      // Build filters
      const filters = {};
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

      // Get all payout requests
      const payouts = await PayoutRequest.find(filters)
        .populate('seller_id', 'first_name last_name email')
        .sort({ created_at: -1 });

      // Calculate summary
      const summary = {
        total_requests: payouts.length,
        total_requested: payouts.reduce((sum, p) => sum + p.amount, 0),
        total_completed: payouts
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + (p.fees?.net_amount || p.amount), 0),
        total_pending: payouts
          .filter(p => ['pending', 'validated', 'approved', 'processing'].includes(p.status))
          .reduce((sum, p) => sum + p.amount, 0),
        total_failed: payouts
          .filter(p => p.status === 'failed')
          .reduce((sum, p) => sum + p.amount, 0),
        total_rejected: payouts
          .filter(p => p.status === 'rejected')
          .reduce((sum, p) => sum + p.amount, 0),
        total_fees: payouts.reduce((sum, p) => sum + (p.fees?.processing_fee || 0), 0)
      };

      // Group by status
      const byStatus = {};
      payouts.forEach(payout => {
        if (!byStatus[payout.status]) {
          byStatus[payout.status] = {
            count: 0,
            total_amount: 0,
            payouts: []
          };
        }
        byStatus[payout.status].count++;
        byStatus[payout.status].total_amount += payout.amount;
        byStatus[payout.status].payouts.push(payout);
      });

      res.json({
        success: true,
        data: {
          summary,
          by_status: byStatus,
          recent_payouts: payouts.slice(0, 50)
        }
      });
    } catch (error) {
      logger.error('Get payout summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payout summary',
        error: error.message
      });
    }
  }

  /**
   * Get payout analytics
   */
  async getPayoutAnalytics(req, res) {
    try {
      const { start_date, end_date, group_by = 'day' } = req.query;

      // Build date filter
      const dateFilter = {};
      if (start_date) {
        dateFilter.$gte = new Date(start_date);
      }
      if (end_date) {
        dateFilter.$lte = new Date(end_date);
      }

      const filters = {
        ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
      };

      // Get completed payouts
      const completedPayouts = await PayoutRequest.find({
        ...filters,
        status: 'completed'
      }).sort({ created_at: -1 });

      // Group by period
      const payoutsByPeriod = this.groupByPeriod(completedPayouts, group_by);

      // Get payouts by method
      const payoutsByMethod = {};
      completedPayouts.forEach(payout => {
        const method = payout.payout_method || 'bank_transfer';
        if (!payoutsByMethod[method]) {
          payoutsByMethod[method] = {
            method,
            count: 0,
            total_amount: 0
          };
        }
        payoutsByMethod[method].count++;
        payoutsByMethod[method].total_amount += payout.fees?.net_amount || payout.amount;
      });

      // Get average payout amount
      const avgPayoutAmount = completedPayouts.length > 0
        ? completedPayouts.reduce((sum, p) => sum + p.amount, 0) / completedPayouts.length
        : 0;

      // Get top sellers by payout
      const sellerPayouts = {};
      completedPayouts.forEach(payout => {
        const sellerId = payout.seller_id.toString();
        if (!sellerPayouts[sellerId]) {
          sellerPayouts[sellerId] = {
            seller_id: sellerId,
            count: 0,
            total_amount: 0
          };
        }
        sellerPayouts[sellerId].count++;
        sellerPayouts[sellerId].total_amount += payout.amount;
      });

      const topSellers = Object.values(sellerPayouts)
        .sort((a, b) => b.total_amount - a.total_amount)
        .slice(0, 10);

      res.json({
        success: true,
        data: {
          summary: {
            total_payouts: completedPayouts.length,
            total_amount: completedPayouts.reduce((sum, p) => sum + (p.fees?.net_amount || p.amount), 0),
            average_payout: avgPayoutAmount,
            total_fees: completedPayouts.reduce((sum, p) => sum + (p.fees?.processing_fee || 0), 0)
          },
          payouts_by_period: payoutsByPeriod,
          payouts_by_method: Object.values(payoutsByMethod),
          top_sellers: topSellers
        }
      });
    } catch (error) {
      logger.error('Get payout analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payout analytics',
        error: error.message
      });
    }
  }

  /**
   * Get commission report
   */
  async getCommissionReport(req, res) {
    try {
      const { start_date, end_date } = req.query;

      // Build date filter
      const dateFilter = {};
      if (start_date) {
        dateFilter.$gte = new Date(start_date);
      }
      if (end_date) {
        dateFilter.$lte = new Date(end_date);
      }

      // Get all orders with commission
      const orders = await Order.find({
        commission_calculated: true,
        ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
      })
        .populate('seller_id', 'first_name last_name email')
        .sort({ created_at: -1 });

      // Calculate totals
      const totals = {
        total_orders: orders.length,
        total_order_value: orders.reduce((sum, o) => sum + o.total_amount, 0),
        total_platform_fee: orders.reduce((sum, o) => sum + (o.platform_fee || 0), 0),
        total_seller_earning: orders.reduce((sum, o) => sum + (o.seller_earning || 0), 0),
        total_commission: orders.reduce((sum, o) => sum + (o.commission || 0), 0),
        total_net_payout: orders.reduce((sum, o) => sum + (o.net_payout || 0), 0)
      };

      // Get commission by rule
      const commissionByRule = {};
      orders.forEach(order => {
        if (order.commission_breakdown) {
          order.commission_breakdown.forEach(breakdown => {
            const ruleName = breakdown.rule_name || 'Default';
            if (!commissionByRule[ruleName]) {
              commissionByRule[ruleName] = {
                rule_name: ruleName,
                rule_type: breakdown.rule_type,
                order_count: 0,
                total_commission: 0
              };
            }
            commissionByRule[ruleName].order_count++;
            commissionByRule[ruleName].total_commission += breakdown.commission_amount || 0;
          });
        }
      });

      // Get top sellers by commission
      const sellerCommissions = {};
      orders.forEach(order => {
        if (order.seller_id) {
          const sellerId = order.seller_id._id?.toString() || order.seller_id.toString();
          if (!sellerCommissions[sellerId]) {
            sellerCommissions[sellerId] = {
              seller_id: sellerId,
              seller_name: order.seller_id.first_name + ' ' + order.seller_id.last_name,
              order_count: 0,
              total_commission: 0,
              total_earning: 0
            };
          }
          sellerCommissions[sellerId].order_count++;
          sellerCommissions[sellerId].total_commission += order.commission || 0;
          sellerCommissions[sellerId].total_earning += order.seller_earning || 0;
        }
      });

      const topSellers = Object.values(sellerCommissions)
        .sort((a, b) => b.total_commission - a.total_commission)
        .slice(0, 20);

      res.json({
        success: true,
        data: {
          summary: totals,
          commission_by_rule: Object.values(commissionByRule),
          top_sellers: topSellers,
          recent_orders: orders.slice(0, 50)
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
   * Helper: Group by period
   */
  groupByPeriod(items, groupBy) {
    const grouped = {};

    items.forEach(item => {
      const date = new Date(item.created_at);
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
      grouped[key].total_amount += item.fees?.net_amount || item.amount;
    });

    return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
  }
}

module.exports = new AdminReportController();

