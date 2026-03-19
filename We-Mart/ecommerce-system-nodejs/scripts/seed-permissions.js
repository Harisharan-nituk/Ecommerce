/**
 * Seed Permissions Script
 * Creates all system permissions organized by modules
 * Run: node scripts/seed-permissions.js
 */

require('dotenv').config();
const mongooseConnection = require('../src/config/mongoose');
const { Permission, Role, RolePermission } = require('../src/models/mongoose');

const permissions = [
  // User Management
  { name: 'user.create', description: 'Create users', module: 'users' },
  { name: 'user.read', description: 'View users', module: 'users' },
  { name: 'user.update', description: 'Update users', module: 'users' },
  { name: 'user.delete', description: 'Delete users', module: 'users' },
  { name: 'user.manage_roles', description: 'Assign roles to users', module: 'users' },
  
  // Role Management
  { name: 'role.create', description: 'Create roles', module: 'roles' },
  { name: 'role.read', description: 'View roles', module: 'roles' },
  { name: 'role.update', description: 'Update roles', module: 'roles' },
  { name: 'role.delete', description: 'Delete roles', module: 'roles' },
  { name: 'role.manage_permissions', description: 'Assign permissions to roles', module: 'roles' },
  
  // Permission Management
  { name: 'permission.create', description: 'Create permissions', module: 'permissions' },
  { name: 'permission.read', description: 'View permissions', module: 'permissions' },
  { name: 'permission.update', description: 'Update permissions', module: 'permissions' },
  { name: 'permission.delete', description: 'Delete permissions', module: 'permissions' },
  
  // Product Management
  { name: 'product.create', description: 'Create products', module: 'products' },
  { name: 'product.read', description: 'View products', module: 'products' },
  { name: 'product.update', description: 'Update products', module: 'products' },
  { name: 'product.delete', description: 'Delete products', module: 'products' },
  { name: 'product.manage_categories', description: 'Manage product categories', module: 'products' },
  { name: 'product.manage_inventory', description: 'Manage inventory', module: 'products' },
  { name: 'product.manage_reviews', description: 'Manage product reviews', module: 'products' },
  
  // Order Management
  { name: 'order.create', description: 'Create orders', module: 'orders' },
  { name: 'order.read', description: 'View orders', module: 'orders' },
  { name: 'order.update', description: 'Update orders', module: 'orders' },
  { name: 'order.delete', description: 'Delete orders', module: 'orders' },
  { name: 'order.process', description: 'Process orders', module: 'orders' },
  { name: 'order.cancel', description: 'Cancel orders', module: 'orders' },
  { name: 'order.refund', description: 'Process refunds', module: 'orders' },
  
  // Cart Management
  { name: 'cart.create', description: 'Add to cart', module: 'cart' },
  { name: 'cart.read', description: 'View cart', module: 'cart' },
  { name: 'cart.update', description: 'Update cart', module: 'cart' },
  { name: 'cart.delete', description: 'Remove from cart', module: 'cart' },
  
  // Payment Management
  { name: 'payment.create', description: 'Process payments', module: 'payments' },
  { name: 'payment.read', description: 'View payments', module: 'payments' },
  { name: 'payment.update', description: 'Update payments', module: 'payments' },
  { name: 'payment.refund', description: 'Process refunds', module: 'payments' },
  { name: 'payment.reconcile', description: 'Reconcile payments', module: 'payments' },
  
  // Customer Management
  { name: 'customer.read', description: 'View customers', module: 'customers' },
  { name: 'customer.update', description: 'Update customer data', module: 'customers' },
  { name: 'customer.delete', description: 'Delete customers', module: 'customers' },
  { name: 'customer.manage_addresses', description: 'Manage customer addresses', module: 'customers' },
  { name: 'customer.view_orders', description: 'View customer orders', module: 'customers' },
  
  // Support Management
  { name: 'support.ticket.create', description: 'Create support tickets', module: 'support' },
  { name: 'support.ticket.read', description: 'View support tickets', module: 'support' },
  { name: 'support.ticket.update', description: 'Update support tickets', module: 'support' },
  { name: 'support.ticket.delete', description: 'Delete support tickets', module: 'support' },
  { name: 'support.faq.manage', description: 'Manage FAQ', module: 'support' },
  { name: 'support.chat.manage', description: 'Manage live chat', module: 'support' },
  
  // CMS (Content Management)
  { name: 'cms.page.create', description: 'Create pages', module: 'cms' },
  { name: 'cms.page.read', description: 'View pages', module: 'cms' },
  { name: 'cms.page.update', description: 'Update pages', module: 'cms' },
  { name: 'cms.page.delete', description: 'Delete pages', module: 'cms' },
  { name: 'cms.banner.manage', description: 'Manage banners', module: 'cms' },
  { name: 'cms.blog.manage', description: 'Manage blog posts', module: 'cms' },
  { name: 'cms.seo.manage', description: 'Manage SEO', module: 'cms' },
  
  // Reporting & Analytics
  { name: 'report.sales', description: 'View sales reports', module: 'reports' },
  { name: 'report.products', description: 'View product reports', module: 'reports' },
  { name: 'report.customers', description: 'View customer reports', module: 'reports' },
  { name: 'report.inventory', description: 'View inventory reports', module: 'reports' },
  { name: 'report.payments', description: 'View payment reports', module: 'reports' },
  { name: 'report.orders', description: 'View order reports', module: 'reports' },
  { name: 'report.export', description: 'Export reports', module: 'reports' },
  
  // Marketing
  { name: 'marketing.coupon.create', description: 'Create coupons', module: 'marketing' },
  { name: 'marketing.coupon.manage', description: 'Manage coupons', module: 'marketing' },
  { name: 'marketing.campaign.create', description: 'Create campaigns', module: 'marketing' },
  { name: 'marketing.campaign.manage', description: 'Manage campaigns', module: 'marketing' },
  { name: 'marketing.email.manage', description: 'Manage email marketing', module: 'marketing' },
  
  // Notifications
  { name: 'notification.create', description: 'Create notifications', module: 'notifications' },
  { name: 'notification.read', description: 'View notifications', module: 'notifications' },
  { name: 'notification.update', description: 'Update notifications', module: 'notifications' },
  { name: 'notification.delete', description: 'Delete notifications', module: 'notifications' },
  { name: 'notification.template.manage', description: 'Manage notification templates', module: 'notifications' },
  
  // Internationalization
  { name: 'i18n.language.manage', description: 'Manage languages', module: 'i18n' },
  { name: 'i18n.currency.manage', description: 'Manage currencies', module: 'i18n' },
  { name: 'i18n.translation.manage', description: 'Manage translations', module: 'i18n' },
  
  // Admin Dashboard
  { name: 'admin.dashboard', description: 'Access admin dashboard', module: 'admin' },
  { name: 'admin.settings', description: 'Manage system settings', module: 'admin' },
  { name: 'admin.audit_logs', description: 'View audit logs', module: 'admin' },
  
  // Vendor/Seller specific
  { name: 'vendor.product.manage_own', description: 'Manage own products', module: 'vendor' },
  { name: 'vendor.order.manage_own', description: 'Manage own orders', module: 'vendor' },
  { name: 'vendor.report.own_sales', description: 'View own sales reports', module: 'vendor' },
];

const defaultRolePermissions = {
  'Super Admin': [], // All permissions (handled in code)
  'Admin': [
    'user.create', 'user.read', 'user.update', 'user.delete', 'user.manage_roles',
    'cms.page.create', 'cms.page.read', 'cms.page.update', 'cms.page.delete',
    'cms.banner.manage', 'cms.blog.manage', 'cms.seo.manage',
    'report.sales', 'report.products', 'report.customers', 'report.inventory',
    'report.payments', 'report.orders', 'report.export',
    'notification.create', 'notification.read', 'notification.update',
    'notification.delete', 'notification.template.manage',
    'support.ticket.create', 'support.ticket.read', 'support.ticket.update',
    'support.ticket.delete', 'support.faq.manage', 'support.chat.manage',
    'marketing.coupon.create', 'marketing.coupon.manage',
    'marketing.campaign.create', 'marketing.campaign.manage',
    'marketing.email.manage',
    'i18n.language.manage', 'i18n.currency.manage', 'i18n.translation.manage',
    'admin.dashboard', 'admin.settings', 'admin.audit_logs',
  ],
  'Manager': [
    'product.create', 'product.read', 'product.update', 'product.delete',
    'product.manage_categories', 'product.manage_inventory', 'product.manage_reviews',
    'order.read', 'order.update', 'order.process', 'order.cancel',
    'report.inventory', 'report.sales',
    'support.ticket.read', 'support.ticket.update',
  ],
  'Customer': [
    'cart.create', 'cart.read', 'cart.update', 'cart.delete',
    'order.create', 'order.read',
    'customer.read', 'customer.update', 'customer.manage_addresses',
    'customer.view_orders',
    'support.ticket.create',
  ],
  'Vendor/Seller': [
    'vendor.product.manage_own', 'vendor.order.manage_own', 'vendor.report.own_sales',
    'product.read', 'order.read',
  ],
  'Support Staff': [
    'support.ticket.read', 'support.ticket.update',
    'customer.read',
    'support.faq.manage',
  ],
  'Content Manager': [
    'cms.page.create', 'cms.page.read', 'cms.page.update', 'cms.page.delete',
    'cms.banner.manage', 'cms.blog.manage', 'cms.seo.manage',
  ],
  'Finance Manager': [
    'report.payments', 'report.orders', 'report.sales', 'report.export',
    'payment.read', 'payment.reconcile',
    'order.read',
  ],
};

async function seedPermissions() {
  try {
    console.log('🚀 Starting permissions seeding...\n');

    // Connect to MongoDB
    await mongooseConnection.connect();
    
    if (!mongooseConnection.isConnected()) {
      throw new Error('Failed to connect to MongoDB');
    }

    // 1. Create all permissions
    console.log('📝 Creating permissions...');
    const createdPermissions = [];
    for (const perm of permissions) {
      let permission = await Permission.findOne({ name: perm.name });
      if (!permission) {
        permission = await Permission.create({
          ...perm,
          status: 'active',
        });
        createdPermissions.push(permission);
      }
    }

    if (createdPermissions.length > 0) {
      console.log(`✅ Created ${createdPermissions.length} new permissions`);
    } else {
      console.log('ℹ️  All permissions already exist');
    }

    // 2. Create default roles and assign permissions
    console.log('\n📝 Creating roles and assigning permissions...');
    
    for (const [roleName, permissionNames] of Object.entries(defaultRolePermissions)) {
      // Create or get role
      let role = await Role.findOne({ name: roleName });
      if (!role) {
        role = await Role.create({
          name: roleName,
          description: getRoleDescription(roleName),
          status: 'active',
        });
        console.log(`✅ Created role: ${roleName}`);
      } else {
        console.log(`ℹ️  Role already exists: ${roleName}`);
      }

      // Assign permissions to role
      if (roleName === 'Super Admin') {
        // Super Admin gets all permissions
        const allPermissions = await Permission.find({ status: 'active' });
        for (const permission of allPermissions) {
          const existing = await RolePermission.findOne({
            role_id: role._id,
            permission_id: permission._id,
          });
          if (!existing) {
            await RolePermission.create({
              role_id: role._id,
              permission_id: permission._id,
            });
          }
        }
        console.log(`✅ Assigned all permissions to Super Admin`);
      } else {
        // Assign specific permissions
        let assignedCount = 0;
        for (const permName of permissionNames) {
          const permission = await Permission.findOne({ name: permName });
          if (permission) {
            const existing = await RolePermission.findOne({
              role_id: role._id,
              permission_id: permission._id,
            });
            if (!existing) {
              await RolePermission.create({
                role_id: role._id,
                permission_id: permission._id,
              });
              assignedCount++;
            }
          }
        }
        console.log(`✅ Assigned ${assignedCount} permissions to ${roleName}`);
      }
    }

    console.log('\n✅ Permissions seeding complete!');
    await mongooseConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    await mongooseConnection.disconnect();
    process.exit(1);
  }
}

function getRoleDescription(roleName) {
  const descriptions = {
    'Super Admin': 'Super Admin has full access to all features and permissions',
    'Admin': 'Admin manages store operations, content, and reports',
    'Manager': 'Manager handles inventory, orders, and sales',
    'Customer': 'Customer can browse, purchase, and manage their account',
    'Vendor/Seller': 'Vendor manages their own products and orders',
    'Support Staff': 'Support Staff handles customer queries and tickets',
    'Content Manager': 'Content Manager manages website content and SEO',
    'Finance Manager': 'Finance Manager handles payments and financial reports',
  };
  return descriptions[roleName] || `${roleName} role`;
}

// Run the script
seedPermissions();

