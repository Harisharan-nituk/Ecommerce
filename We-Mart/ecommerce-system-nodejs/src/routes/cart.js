const express = require('express');
const router = express.Router();
const cartController = require('../controllers/CartController');
const { authenticate } = require('../middleware/auth');
const { validateCartItem } = require('../utils/validators');

// All cart routes require authentication
router.get('/', authenticate, cartController.getCart.bind(cartController));
router.post('/', authenticate, validateCartItem, cartController.addToCart.bind(cartController));
router.put('/:id', authenticate, cartController.updateCartItem.bind(cartController));
router.delete('/:id', authenticate, cartController.removeFromCart.bind(cartController));
router.delete('/', authenticate, cartController.clearCart.bind(cartController));

module.exports = router;

