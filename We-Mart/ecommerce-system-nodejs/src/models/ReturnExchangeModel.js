const logger = require('../utils/logger');

class ReturnExchangeModel {
  constructor() {
    this.useMongoDB = process.env.MONGODB_ENABLED === 'true';
  }

  /**
   * Create return/exchange request
   */
  async createReturnExchange(data) {
    try {
      if (this.useMongoDB) {
        const ReturnExchange = require('./mongoose/ReturnExchange');
        const returnExchange = new ReturnExchange(data);
        await returnExchange.save();
        return returnExchange._id;
      } else {
        // MySQL implementation
        const mysql = require('../config/database').mysql;
        const [result] = await mysql.query(
          `INSERT INTO tbl_return_exchanges 
          (order_id, product_id, user_id, type, reason, reason_description, quantity, status, 
           exchange_product_id, exchange_size, exchange_color, refund_amount, delivery_charges, 
           refund_delivery_charges, total_refund, return_tracking_number, return_carrier, 
           return_shipping_cost, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            data.order_id,
            data.product_id,
            data.user_id,
            data.type,
            data.reason,
            data.reason_description || null,
            data.quantity,
            data.status || 'pending',
            data.exchange_product_id || null,
            data.exchange_size || null,
            data.exchange_color || null,
            data.refund_amount || 0,
            data.delivery_charges || 0,
            data.refund_delivery_charges || false,
            data.total_refund || 0,
            data.return_tracking_number || null,
            data.return_carrier || null,
            data.return_shipping_cost || 0
          ]
        );
        return result.insertId;
      }
    } catch (error) {
      logger.error('Create return/exchange error:', error);
      throw error;
    }
  }

  /**
   * Get return/exchange by ID
   */
  async getReturnExchangeById(returnId) {
    try {
      if (this.useMongoDB) {
        const ReturnExchange = require('./mongoose/ReturnExchange');
        return await ReturnExchange.findById(returnId)
          .populate('order_id')
          .populate('product_id')
          .populate('user_id', 'first_name last_name email')
          .populate('exchange_product_id')
          .populate('processed_by', 'first_name last_name')
          .lean();
      } else {
        // MySQL implementation
        const mysql = require('../config/database').mysql;
        const [rows] = await mysql.query(
          'SELECT * FROM tbl_return_exchanges WHERE id = ?',
          [returnId]
        );
        return rows[0] || null;
      }
    } catch (error) {
      logger.error('Get return/exchange error:', error);
      throw error;
    }
  }

  /**
   * Get returns/exchanges for a user
   */
  async getUserReturns(userId, filters = {}) {
    try {
      if (this.useMongoDB) {
        const ReturnExchange = require('./mongoose/ReturnExchange');
        const query = { user_id: userId };
        
        if (filters.status) {
          query.status = filters.status;
        }
        if (filters.type) {
          query.type = filters.type;
        }

        return await ReturnExchange.find(query)
          .sort({ created_at: -1 })
          .populate('order_id')
          .populate('product_id')
          .populate('exchange_product_id')
          .limit(filters.limit || 50)
          .lean();
      } else {
        const mysql = require('../config/database').mysql;
        let query = 'SELECT * FROM tbl_return_exchanges WHERE user_id = ?';
        const params = [userId];
        
        if (filters.status) {
          query += ' AND status = ?';
          params.push(filters.status);
        }
        if (filters.type) {
          query += ' AND type = ?';
          params.push(filters.type);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(filters.limit || 50);
        
        const [rows] = await mysql.query(query, params);
        return rows;
      }
    } catch (error) {
      logger.error('Get user returns error:', error);
      throw error;
    }
  }

  /**
   * Get all returns/exchanges (admin)
   */
  async getAllReturns(filters = {}) {
    try {
      if (this.useMongoDB) {
        const ReturnExchange = require('./mongoose/ReturnExchange');
        const query = {};
        
        if (filters.status) {
          query.status = filters.status;
        }
        if (filters.type) {
          query.type = filters.type;
        }

        return await ReturnExchange.find(query)
          .sort({ created_at: -1 })
          .populate('order_id')
          .populate('product_id')
          .populate('user_id', 'first_name last_name email')
          .populate('exchange_product_id')
          .limit(filters.limit || 100)
          .lean();
      } else {
        const mysql = require('../config/database').mysql;
        let query = 'SELECT * FROM tbl_return_exchanges WHERE 1=1';
        const params = [];
        
        if (filters.status) {
          query += ' AND status = ?';
          params.push(filters.status);
        }
        if (filters.type) {
          query += ' AND type = ?';
          params.push(filters.type);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(filters.limit || 100);
        
        const [rows] = await mysql.query(query, params);
        return rows;
      }
    } catch (error) {
      logger.error('Get all returns error:', error);
      throw error;
    }
  }

  /**
   * Update return/exchange status
   */
  async updateReturnExchange(returnId, data) {
    try {
      if (this.useMongoDB) {
        const ReturnExchange = require('./mongoose/ReturnExchange');
        const updateData = {
          ...data,
          updated_at: new Date()
        };
        
        if (data.status === 'approved' || data.status === 'rejected' || data.status === 'completed') {
          updateData.processed_at = new Date();
        }
        
        return await ReturnExchange.findByIdAndUpdate(
          returnId,
          updateData,
          { new: true, runValidators: true }
        );
      } else {
        const mysql = require('../config/database').mysql;
        const updateFields = [];
        const params = [];
        
        Object.keys(data).forEach(key => {
          if (key !== 'id') {
            updateFields.push(`${key} = ?`);
            params.push(data[key]);
          }
        });
        
        if (data.status === 'approved' || data.status === 'rejected' || data.status === 'completed') {
          updateFields.push('processed_at = NOW()');
        }
        
        updateFields.push('updated_at = NOW()');
        params.push(returnId);
        
        await mysql.query(
          `UPDATE tbl_return_exchanges SET ${updateFields.join(', ')} WHERE id = ?`,
          params
        );
        return await this.getReturnExchangeById(returnId);
      }
    } catch (error) {
      logger.error('Update return/exchange error:', error);
      throw error;
    }
  }
}

module.exports = new ReturnExchangeModel();
