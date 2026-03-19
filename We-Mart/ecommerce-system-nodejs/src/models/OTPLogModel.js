const dbManager = require('../config/database');
const logger = require('../utils/logger');

class OTPLogModel {
  /**
   * Log OTP request with IP address
   */
  async logOTPRequest(data) {
    const mysql = dbManager.getMySQL();
    
    try {
      const [result] = await mysql.query(
        `INSERT INTO tbl_otp_logs 
         (user_id, mobile, email, otp_code, otp_type, ip_address, user_agent, status, expires_at, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          data.user_id || null,
          data.mobile,
          data.email || null,
          data.otp_code,
          data.otp_type || 'sms',
          data.ip_address || '0.0.0.0',
          data.user_agent || null,
          'sent',
          data.expires_at
        ]
      );

      return result.insertId;
    } catch (error) {
      logger.error('Log OTP request error:', error);
      return null;
    }
  }

  /**
   * Update OTP verification status
   */
  async updateOTPStatus(mobile, code, ipAddress, status, error = null) {
    const mysql = dbManager.getMySQL();
    
    try {
      // Find the most recent OTP log for this mobile
      const [otpLogs] = await mysql.query(
        `SELECT id FROM tbl_otp_logs 
         WHERE mobile = ? AND status = 'sent'
         ORDER BY created_at DESC 
         LIMIT 1`,
        [mobile]
      );

      if (otpLogs && otpLogs.length > 0) {
        const otpLogId = otpLogs[0].id;
        
        await mysql.query(
          `UPDATE tbl_otp_logs 
           SET status = ?,
               verified_at = CASE WHEN ? = 'verified' THEN NOW() ELSE NULL END,
               attempts = attempts + 1,
               updated_at = NOW()
           WHERE id = ?`,
          [status, status, otpLogId]
        );
        
        return otpLogId;
      } else {
        // Create new log entry if not found
        const [result] = await mysql.query(
          `INSERT INTO tbl_otp_logs 
           (mobile, otp_code, otp_type, ip_address, status, attempts, created_at) 
           VALUES (?, ?, 'sms', ?, ?, 1, NOW())`,
          [mobile, code, ipAddress || '0.0.0.0', status]
        );
        
        return result.insertId;
      }
    } catch (error) {
      logger.error('Update OTP status error:', error);
      return null;
    }
  }

  /**
   * Get OTP logs by mobile
   */
  async getOTPLogsByMobile(mobile, limit = 10) {
    const mysql = dbManager.getMySQL();
    
    try {
      const [logs] = await mysql.query(
        `SELECT * FROM tbl_otp_logs 
         WHERE mobile = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [mobile, limit]
      );

      return logs;
    } catch (error) {
      logger.error('Get OTP logs error:', error);
      return [];
    }
  }

  /**
   * Get OTP logs by IP address
   */
  async getOTPLogsByIP(ipAddress, limit = 10) {
    const mysql = dbManager.getMySQL();
    
    try {
      const [logs] = await mysql.query(
        `SELECT * FROM tbl_otp_logs 
         WHERE ip_address = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [ipAddress, limit]
      );

      return logs;
    } catch (error) {
      logger.error('Get OTP logs by IP error:', error);
      return [];
    }
  }
}

module.exports = new OTPLogModel();

