const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth, hasRole } = require('../middleware/auth');

// Controllers
const EmailController = require('../controllers/EmailController');
const SmsController = require('../controllers/SmsController');
const WhatsAppController = require('../controllers/WhatsAppController');
const OtpController = require('../controllers/OtpController');
const SharedController = require('../controllers/SharedController');
const CronController = require('../controllers/CronController');

// Validation middleware
const { body, param, query } = require('express-validator');
const validate = (req, res, next) => {
  const errors = require('express-validator').validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Public Routes (No Authentication)
 */

// OTP Routes
router.post(
  '/send-otp',
  [
    body('mobile').optional().isMobilePhone('any'),
    body('email').optional().isEmail(),
    body('otp_type').optional().isIn(['sms', 'email', 'both']),
  ],
  validate,
  OtpController.sendOtp
);

router.post(
  '/verify-otp',
  [
    body('auth_code').notEmpty(),
    body('otp').notEmpty().isLength({ min: 4, max: 8 }),
  ],
  validate,
  OtpController.verifyOtp
);

router.post(
  '/resend-otp',
  [body('auth_code').notEmpty()],
  validate,
  OtpController.resendOtp
);

// Health Check
router.get('/health-check', CronController.healthCheck);

/**
 * Protected Routes (Authentication Required)
 */

// Email Routes
router.post(
  '/send-email',
  authenticate,
  [
    body('to').isEmail(),
    body('template_code').optional().isString(),
    body('subject').optional().isString(),
    body('body').optional().isString(),
  ],
  validate,
  EmailController.sendEmail
);

router.post(
  '/email-template/:code?',
  authenticate,
  [
    body('name').notEmpty(),
    body('subject').notEmpty(),
    body('body').notEmpty(),
  ],
  validate,
  EmailController.upsertTemplate
);

router.get(
  '/email-template/:code',
  authenticate,
  EmailController.getTemplate
);

router.get(
  '/check-bounced-email/:emailId',
  authenticate,
  EmailController.checkBouncedEmail
);

router.post(
  '/add-bounced-email',
  authenticate,
  [body('email').isEmail()],
  validate,
  EmailController.addBouncedEmail
);

router.post(
  '/unsubscribe-email',
  authenticate,
  [body('email').isEmail()],
  validate,
  EmailController.unsubscribeEmail
);

// SMS Routes
router.post(
  '/send-sms',
  authenticate,
  [
    body('to').notEmpty(),
    body('template_code').optional().isString(),
    body('message').optional().isString(),
  ],
  validate,
  SmsController.sendSms
);

router.post(
  '/sms-template/:code?',
  authenticate,
  [
    body('name').notEmpty(),
    body('message').notEmpty(),
  ],
  validate,
  SmsController.upsertTemplate
);

router.get(
  '/sms-template/:code',
  authenticate,
  SmsController.getTemplate
);

router.get(
  '/check-bounced-mobile/:mobileNo',
  authenticate,
  SmsController.checkBouncedMobile
);

router.post(
  '/add-bounced-mobile',
  authenticate,
  [body('mobile').notEmpty()],
  validate,
  SmsController.addBouncedMobile
);

// WhatsApp Routes
router.post(
  '/send-whatsapp',
  authenticate,
  [
    body('to').notEmpty(),
    body('template_code').optional().isString(),
    body('message').optional().isString(),
  ],
  validate,
  WhatsAppController.sendWhatsApp
);

router.post(
  '/send-hsm',
  authenticate,
  [
    body('to').notEmpty(),
    body('template_sid').notEmpty(),
  ],
  validate,
  WhatsAppController.sendHSM
);

router.post(
  '/whatsapp-template/:id?',
  authenticate,
  [
    body('name').notEmpty(),
    body('message').notEmpty(),
  ],
  validate,
  WhatsAppController.upsertTemplate
);

router.get(
  '/whatsapp-template/:code',
  authenticate,
  WhatsAppController.getTemplate
);

// Shared Routes
router.get(
  '/communication-category',
  authenticate,
  SharedController.getCommunicationCategory
);

router.get(
  '/template-list/:type',
  authenticate,
  SharedController.getTemplateList
);

router.post(
  '/add-bounced-user/:type',
  authenticate,
  [body('value').notEmpty()],
  validate,
  SharedController.addBouncedUser
);

router.get(
  '/check-bounced-user/:type/:value',
  authenticate,
  SharedController.checkBouncedUser
);

router.get(
  '/list-bounced-user/:type',
  authenticate,
  SharedController.getBouncedUserList
);

router.put(
  '/remove-bounced-user/:type',
  authenticate,
  [body('value').notEmpty()],
  validate,
  SharedController.deleteBouncedUser
);

/**
 * Cron Routes (Internal/Admin)
 */
router.get(
  '/cron/process-events',
  authenticate,
  hasRole('Super Admin', 'Admin'),
  CronController.processCommunicationEvents
);

router.get(
  '/cron/clean-events',
  authenticate,
  hasRole('Super Admin', 'Admin'),
  CronController.cleanCommunicationEvents
);

router.get(
  '/cron/clean-otp',
  authenticate,
  hasRole('Super Admin', 'Admin'),
  CronController.cleanOtp
);

module.exports = router;

