const Stripe = require('stripe');
const orderModel = require('../models/OrderModel');
const logger = require('../utils/logger');

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

class PaymentController {
  /**
   * Process payment
   */
  async processPayment(req, res) {
    try {
      const { order_id, payment_method, payment_data } = req.body;

      const order = await orderModel.getOrderById(order_id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      let paymentResult;

      switch (payment_method) {
        case 'stripe':
          paymentResult = await this.processStripePayment(order, payment_data);
          break;
        case 'paypal':
          paymentResult = await this.processPayPalPayment(order, payment_data);
          break;
        case 'razorpay':
          paymentResult = await this.processRazorpayPayment(order, payment_data);
          break;
        case 'cod':
          paymentResult = { success: true, method: 'cod' };
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid payment method'
          });
      }

      if (paymentResult.success) {
        // Update order status
        await orderModel.updateOrderStatus(order_id, 'paid');
      }

      res.json({
        success: paymentResult.success,
        message: paymentResult.message || 'Payment processed',
        data: paymentResult.data
      });
    } catch (error) {
      logger.error('Process payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Payment processing failed',
        error: error.message
      });
    }
  }

  /**
   * Process Stripe payment
   */
  async processStripePayment(order, paymentData) {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total_amount * 100), // Convert to cents
        currency: 'usd',
        payment_method: paymentData.payment_method_id,
        confirm: true,
        return_url: paymentData.return_url
      });

      return {
        success: paymentIntent.status === 'succeeded',
        method: 'stripe',
        data: {
          payment_intent_id: paymentIntent.id,
          status: paymentIntent.status
        }
      };
    } catch (error) {
      logger.error('Stripe payment error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Process PayPal payment
   */
  async processPayPalPayment(order, paymentData) {
    // Implement PayPal integration
    // This is a placeholder - implement actual PayPal SDK
    return {
      success: false,
      message: 'PayPal integration not implemented'
    };
  }

  /**
   * Process Razorpay payment
   */
  async processRazorpayPayment(order, paymentData) {
    // Implement Razorpay integration
    // This is a placeholder - implement actual Razorpay SDK
    return {
      success: false,
      message: 'Razorpay integration not implemented'
    };
  }

  /**
   * Handle payment webhook
   */
  async handleWebhook(req, res) {
    try {
      const sig = req.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!stripe || !webhookSecret) {
        return res.status(400).json({
          success: false,
          message: 'Stripe webhook not configured'
        });
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        logger.error('Webhook signature verification failed:', err);
        return res.status(400).json({
          success: false,
          message: 'Webhook signature verification failed'
        });
      }

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          // Update order status
          const paymentIntent = event.data.object;
          logger.info('Payment succeeded:', paymentIntent.id);
          break;
        case 'payment_intent.payment_failed':
          logger.error('Payment failed:', event.data.object.id);
          break;
        default:
          logger.info('Unhandled event type:', event.type);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed'
      });
    }
  }
}

module.exports = new PaymentController();

