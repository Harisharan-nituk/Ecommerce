const { PayoutRequest } = require('../models/mongoose');
const logger = require('../utils/logger');

/**
 * Invoice Service
 * Generates invoices for payouts
 * Note: PDF generation requires additional library (pdfkit or puppeteer)
 */
class InvoiceService {
  /**
   * Generate invoice for payout
   */
  async generateInvoice(payoutRequestId) {
    try {
      const payout = await PayoutRequest.findById(payoutRequestId)
        .populate('seller_id', 'first_name last_name email phone')
        .populate('invoice_id');

      if (!payout) {
        throw new Error('Payout request not found');
      }

      // Generate invoice number
      const invoiceNumber = this.generateInvoiceNumber(payout);

      // Calculate invoice details
      const invoiceData = {
        invoice_number: invoiceNumber,
        invoice_date: new Date(),
        payout_request_id: payout._id,
        seller_id: payout.seller_id._id,
        seller_details: {
          name: `${payout.seller_id.first_name} ${payout.seller_id.last_name}`,
          email: payout.seller_id.email,
          phone: payout.seller_id.phone
        },
        payout_details: {
          request_id: payout.request_id,
          amount: payout.amount,
          processing_fee: payout.fees?.processing_fee || 0,
          tax_deduction: payout.fees?.tax_deduction || 0,
          net_amount: payout.fees?.net_amount || payout.amount,
          payout_method: payout.payout_method,
          bank_details: payout.bank_details
        },
        status: payout.status,
        created_at: new Date()
      };

      // TODO: Generate PDF using pdfkit or puppeteer
      // For now, return invoice data structure
      logger.info(`Generated invoice ${invoiceNumber} for payout ${payout.request_id}`);

      return invoiceData;
    } catch (error) {
      logger.error('Generate invoice error:', error);
      throw error;
    }
  }

  /**
   * Generate invoice number
   */
  generateInvoiceNumber(payout) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const sequence = String(payout._id.toString().slice(-6)).toUpperCase();
    
    return `INV-${year}${month}${day}-${sequence}`;
  }

  /**
   * Calculate GST (if applicable)
   */
  calculateGST(amount, gstRate = 18) {
    const gstAmount = (amount * gstRate) / (100 + gstRate);
    const baseAmount = amount - gstAmount;
    
    return {
      base_amount: baseAmount,
      gst_rate: gstRate,
      gst_amount: gstAmount,
      total_amount: amount
    };
  }

  /**
   * Generate invoice PDF (placeholder - requires pdfkit)
   */
  async generatePDF(invoiceData) {
    // TODO: Implement PDF generation using pdfkit or puppeteer
    // Example structure:
    /*
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    doc.text('Invoice', { align: 'center' });
    doc.text(`Invoice Number: ${invoiceData.invoice_number}`);
    // ... more invoice content
    
    return doc;
    */
    
    logger.warn('PDF generation not implemented. Install pdfkit or puppeteer.');
    return null;
  }
}

module.exports = new InvoiceService();

