const returnExchangeModel = require('../models/ReturnExchangeModel');
const ReturnExchange = require('../models/mongoose/ReturnExchange');
const logger = require('../utils/logger');

class ReturnExchangeController {
  /**
   * Create return/exchange request
   */
  async createReturnExchange(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const { order_id, product_id, type, reason, reason_description, quantity, exchange_product_id, exchange_size, exchange_color, refund_delivery_charges } = req.body;

      if (!order_id || !product_id || !type || !reason || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: order_id, product_id, type, reason, quantity'
        });
      }

      // Calculate refund amount
      const refundCalculation = await ReturnExchange.calculateRefund(
        order_id,
        product_id,
        quantity,
        refund_delivery_charges || false
      );

      const returnData = {
        order_id,
        product_id,
        user_id: userId,
        type,
        reason,
        reason_description: reason_description || null,
        quantity,
        refund_amount: refundCalculation.item_refund,
        delivery_charges: refundCalculation.delivery_charges,
        refund_delivery_charges: refund_delivery_charges || false,
        total_refund: refundCalculation.total_refund,
        exchange_product_id: type === 'exchange' ? exchange_product_id : null,
        exchange_size: type === 'exchange' ? exchange_size : null,
        exchange_color: type === 'exchange' ? exchange_color : null,
        status: 'pending'
      };

      const returnId = await returnExchangeModel.createReturnExchange(returnData);

      res.status(201).json({
        success: true,
        message: 'Return/Exchange request created successfully',
        data: {
          return_id: returnId,
          refund_calculation: refundCalculation
        }
      });
    } catch (error) {
      logger.error('Create return/exchange error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create return/exchange request',
        error: error.message
      });
    }
  }

  /**
   * Get user's return/exchange requests
   */
  async getUserReturns(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const filters = {
        status: req.query.status,
        type: req.query.type,
        limit: parseInt(req.query.limit) || 50
      };

      const returns = await returnExchangeModel.getUserReturns(userId, filters);

      res.json({
        success: true,
        data: returns,
        count: returns.length
      });
    } catch (error) {
      logger.error('Get user returns error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get return/exchange requests'
      });
    }
  }

  /**
   * Get all return/exchange requests (admin)
   */
  async getAllReturns(req, res) {
    try {
      const filters = {
        status: req.query.status,
        type: req.query.type,
        limit: parseInt(req.query.limit) || 100
      };

      const returns = await returnExchangeModel.getAllReturns(filters);

      res.json({
        success: true,
        data: returns,
        count: returns.length
      });
    } catch (error) {
      logger.error('Get all returns error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get return/exchange requests'
      });
    }
  }

  /**
   * Get return/exchange by ID
   */
  async getReturnExchange(req, res) {
    try {
      const returnId = req.params.id;
      const returnExchange = await returnExchangeModel.getReturnExchangeById(returnId);

      if (!returnExchange) {
        return res.status(404).json({
          success: false,
          message: 'Return/Exchange request not found'
        });
      }

      res.json({
        success: true,
        data: returnExchange
      });
    } catch (error) {
      logger.error('Get return/exchange error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get return/exchange request'
      });
    }
  }

  /**
   * Calculate refund amount
   */
  async calculateRefund(req, res) {
    try {
      const { order_id, product_id, quantity, refund_delivery_charges } = req.body;

      if (!order_id || !product_id || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: order_id, product_id, quantity'
        });
      }

      const refundCalculation = await ReturnExchange.calculateRefund(
        order_id,
        product_id,
        quantity,
        refund_delivery_charges || false
      );

      res.json({
        success: true,
        data: refundCalculation
      });
    } catch (error) {
      logger.error('Calculate refund error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate refund',
        error: error.message
      });
    }
  }

  /**
   * Update return/exchange status (admin)
   */
  async updateReturnExchange(req, res) {
    try {
      const returnId = req.params.id;
      const { status, admin_notes, rejection_reason, return_tracking_number, return_carrier } = req.body;
      const processedBy = req.user?.id || req.user?._id;

      const updateData = {
        processed_by: processedBy
      };

      if (status) updateData.status = status;
      if (admin_notes) updateData.admin_notes = admin_notes;
      if (rejection_reason) updateData.rejection_reason = rejection_reason;
      if (return_tracking_number) updateData.return_tracking_number = return_tracking_number;
      if (return_carrier) updateData.return_carrier = return_carrier;

      const updated = await returnExchangeModel.updateReturnExchange(returnId, updateData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Return/Exchange request not found'
        });
      }

      res.json({
        success: true,
        message: 'Return/Exchange request updated successfully',
        data: updated
      });
    } catch (error) {
      logger.error('Update return/exchange error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update return/exchange request'
      });
    }
  }

  /**
   * Cancel return/exchange request
   */
  async cancelReturnExchange(req, res) {
    try {
      const returnId = req.params.id;
      const userId = req.user?.id || req.user?._id;

      const returnExchange = await returnExchangeModel.getReturnExchangeById(returnId);

      if (!returnExchange) {
        return res.status(404).json({
          success: false,
          message: 'Return/Exchange request not found'
        });
      }

      // Check if user owns this return
      const returnUserId = returnExchange.user_id?._id || returnExchange.user_id || returnExchange.user_id;
      if (returnUserId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to cancel this request'
        });
      }

      // Only allow cancellation if status is pending
      if (returnExchange.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel return/exchange request. Status is not pending.'
        });
      }

      const updated = await returnExchangeModel.updateReturnExchange(returnId, {
        status: 'cancelled'
      });

      res.json({
        success: true,
        message: 'Return/Exchange request cancelled successfully',
        data: updated
      });
    } catch (error) {
      logger.error('Cancel return/exchange error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel return/exchange request'
      });
    }
  }
}

module.exports = new ReturnExchangeController();
