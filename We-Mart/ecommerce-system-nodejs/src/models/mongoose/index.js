/**
 * Mongoose Models Index
 * Export all models for easy importing
 */

const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const UserRole = require('./UserRole');
const RolePermission = require('./RolePermission');
const Product = require('./Product');
const Category = require('./Category');
const Cart = require('./Cart');
const Order = require('./Order');
const Payment = require('./Payment');
const SellerApplication = require('./SellerApplication');
const SellerWallet = require('./SellerWallet');
const CustomerWallet = require('./CustomerWallet');
const CommissionRule = require('./CommissionRule');
const PayoutRequest = require('./PayoutRequest');
const WalletTransaction = require('./WalletTransaction');
const OrderTracking = require('./OrderTracking');
const InventoryMovement = require('./Inventory');
const Brand = require('./Brand');
const ReturnExchange = require('./ReturnExchange');
const Review = require('./Review');

module.exports = {
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Product,
  Category,
  Brand,
  Cart,
  Order,
  Payment,
  SellerApplication,
  SellerWallet,
  CustomerWallet,
  CommissionRule,
  PayoutRequest,
  WalletTransaction,
  OrderTracking,
  InventoryMovement,
  ReturnExchange,
  Review,
};

