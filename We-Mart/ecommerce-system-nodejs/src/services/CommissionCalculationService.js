const { CommissionRule, Order, Product, User } = require('../models/mongoose');
const sellerWalletService = require('./SellerWalletService');
const notificationService = require('./NotificationService');
const logger = require('../utils/logger');

/**
 * Commission Calculation Service
 * Calculates seller commissions based on rules
 */
class CommissionCalculationService {
  /**
   * Calculate commission for an order
   */
  async calculateCommission(order, sellerId) {
    try {
      // Get seller information (you may need to fetch from User model)
      const seller = { tier: 'bronze', rating: 4.5 }; // TODO: Fetch actual seller data
      
      // Find matching commission rules
      const matchingRules = await CommissionRule.findMatchingRules(order, seller);
      
      if (matchingRules.length === 0) {
        logger.warn(`No commission rules found for order ${order._id}`);
        return this.calculateDefaultCommission(order);
      }
      
      // Calculate commission based on rules
      let totalCommission = 0;
      const commissionBreakdown = [];
      
      for (const rule of matchingRules) {
        const commission = rule.calculateCommission(order.total_amount);
        totalCommission += commission;
        
        commissionBreakdown.push({
          rule_name: rule.rule_name,
          rule_type: rule.rule_type,
          commission_value: rule.commission_value,
          commission_amount: commission
        });
      }
      
      // Calculate platform fee (default 10%)
      const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '10');
      const platformFee = order.total_amount * (platformFeePercentage / 100);
      
      // Calculate seller earning
      const sellerEarning = order.total_amount - platformFee;
      const netPayout = sellerEarning + totalCommission;
      
      return {
        order_id: order._id,
        order_total: order.total_amount,
        platform_fee: platformFee,
        platform_fee_percentage: platformFeePercentage,
        seller_earning: sellerEarning,
        commission: totalCommission,
        commission_breakdown: commissionBreakdown,
        net_payout: netPayout,
        currency: 'INR'
      };
    } catch (error) {
      logger.error('Calculate commission error:', error);
      throw error;
    }
  }

  /**
   * Calculate default commission (when no rules match)
   */
  calculateDefaultCommission(order) {
    const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '10');
    const platformFee = order.total_amount * (platformFeePercentage / 100);
    const sellerEarning = order.total_amount - platformFee;
    
    return {
      order_id: order._id,
      order_total: order.total_amount,
      platform_fee: platformFee,
      platform_fee_percentage: platformFeePercentage,
      seller_earning: sellerEarning,
      commission: 0,
      commission_breakdown: [],
      net_payout: sellerEarning,
      currency: 'INR'
    };
  }

  /**
   * Process order commission (calculate and credit to wallet)
   */
  async processOrderCommission(order, sellerId) {
    try {
      // Calculate commission
      const commissionResult = await this.calculateCommission(order, sellerId);
      
      // Credit to pending balance (will move to available when order is delivered)
      await sellerWalletService.creditPending(
        sellerId,
        commissionResult.net_payout,
        'order',
        order._id.toString(),
        `Commission for order ${order.order_number || order._id}`,
        order._id
      );
      
      // Update order with commission details
      order.commission_calculated = true;
      order.seller_earning = commissionResult.seller_earning;
      order.platform_fee = commissionResult.platform_fee;
      order.commission = commissionResult.commission;
      order.net_payout = commissionResult.net_payout;
      order.commission_breakdown = commissionResult.commission_breakdown;
      await order.save();
      
      // Send notification to seller
      try {
        const seller = await User.findById(sellerId);
        if (seller) {
          await notificationService.notifyCommissionCredited(seller, order, commissionResult.net_payout);
        }
      } catch (notifyError) {
        logger.warn('Commission notification failed:', notifyError);
      }
      
      logger.info(`Processed commission for order ${order._id}: ${commissionResult.net_payout}`);
      
      return commissionResult;
    } catch (error) {
      logger.error('Process order commission error:', error);
      throw error;
    }
  }

  /**
   * Move commission from pending to available when order is delivered
   */
  async confirmOrderCommission(order, sellerId) {
    try {
      if (!order.commission_calculated || !order.net_payout) {
        throw new Error('Commission not calculated for this order');
      }
      
      // Move from pending to available
      await sellerWalletService.movePendingToAvailable(
        sellerId,
        order.net_payout,
        order._id
      );
      
      logger.info(`Confirmed commission for order ${order._id}: ${order.net_payout}`);
      
      return {
        order_id: order._id,
        amount: order.net_payout,
        status: 'confirmed'
      };
    } catch (error) {
      logger.error('Confirm order commission error:', error);
      throw error;
    }
  }

  /**
   * Reverse commission (for cancelled/returned orders)
   */
  async reverseCommission(order, sellerId) {
    try {
      if (!order.net_payout) {
        logger.warn(`No commission to reverse for order ${order._id}`);
        return null;
      }
      
      // Debit from available balance (or pending if not yet confirmed)
      const wallet = await sellerWalletService.getWallet(sellerId);
      
      if (wallet.available_balance >= order.net_payout) {
        await sellerWalletService.debit(
          sellerId,
          order.net_payout,
          'order',
          order._id.toString(),
          `Commission reversed for cancelled order ${order.order_number || order._id}`
        );
      } else if (wallet.pending_balance >= order.net_payout) {
        // If in pending, we need to handle this differently
        // For now, we'll debit from available (may go negative temporarily)
        await sellerWalletService.debit(
          sellerId,
          order.net_payout,
          'order',
          order._id.toString(),
          `Commission reversed for cancelled order ${order.order_number || order._id}`
        );
      }
      
      // Update order
      order.commission_reversed = true;
      await order.save();
      
      logger.info(`Reversed commission for order ${order._id}: ${order.net_payout}`);
      
      return {
        order_id: order._id,
        amount: order.net_payout,
        status: 'reversed'
      };
    } catch (error) {
      logger.error('Reverse commission error:', error);
      throw error;
    }
  }

  /**
   * Get all active commission rules
   */
  async getActiveRules() {
    try {
      return await CommissionRule.findActiveRules();
    } catch (error) {
      logger.error('Get active rules error:', error);
      throw error;
    }
  }

  /**
   * Create commission rule
   */
  async createRule(ruleData) {
    try {
      const rule = await CommissionRule.create(ruleData);
      logger.info(`Created commission rule: ${rule.rule_name}`);
      return rule;
    } catch (error) {
      logger.error('Create rule error:', error);
      throw error;
    }
  }

  /**
   * Update commission rule
   */
  async updateRule(ruleId, updateData) {
    try {
      const rule = await CommissionRule.findByIdAndUpdate(
        ruleId,
        { ...updateData, updated_at: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!rule) {
        throw new Error('Commission rule not found');
      }
      
      logger.info(`Updated commission rule: ${rule.rule_name}`);
      return rule;
    } catch (error) {
      logger.error('Update rule error:', error);
      throw error;
    }
  }

  /**
   * Delete commission rule
   */
  async deleteRule(ruleId) {
    try {
      const rule = await CommissionRule.findByIdAndUpdate(
        ruleId,
        { status: 'inactive', updated_at: new Date() },
        { new: true }
      );
      
      if (!rule) {
        throw new Error('Commission rule not found');
      }
      
      logger.info(`Deleted commission rule: ${rule.rule_name}`);
      return rule;
    } catch (error) {
      logger.error('Delete rule error:', error);
      throw error;
    }
  }
}

module.exports = new CommissionCalculationService();

