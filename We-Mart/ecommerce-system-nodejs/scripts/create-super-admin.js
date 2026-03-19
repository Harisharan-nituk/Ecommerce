/**
 * Script to create Super Admin user in MongoDB
 * Run: node scripts/create-super-admin.js
 */

require('dotenv').config();
const mongooseConnection = require('../src/config/mongoose');
const { User, Role, Permission, UserRole, RolePermission } = require('../src/models/mongoose');
const { hashPassword } = require('../src/utils/encryption');

async function createSuperAdmin() {
  try {
    console.log('🚀 Starting Super Admin creation...\n');

    // Connect to MongoDB
    await mongooseConnection.connect();
    
    if (!mongooseConnection.isConnected()) {
      throw new Error('Failed to connect to MongoDB');
    }

    // 1. Create Super Admin Role
    console.log('📝 Creating Super Admin role...');
    let superAdminRole = await Role.findOne({ name: 'Super Admin' });
    
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'Super Admin',
        description: 'Super Admin has full access to all features and permissions',
        status: 'active',
      });
      console.log('✅ Super Admin role created');
    } else {
      console.log('ℹ️  Super Admin role already exists');
    }

    // 2. Create default permissions
    console.log('\n📝 Creating default permissions...');
    const defaultPermissions = [
      { name: 'user.create', description: 'Create users', module: 'users' },
      { name: 'user.read', description: 'View users', module: 'users' },
      { name: 'user.update', description: 'Update users', module: 'users' },
      { name: 'user.delete', description: 'Delete users', module: 'users' },
      { name: 'role.create', description: 'Create roles', module: 'roles' },
      { name: 'role.read', description: 'View roles', module: 'roles' },
      { name: 'role.update', description: 'Update roles', module: 'roles' },
      { name: 'role.delete', description: 'Delete roles', module: 'roles' },
      { name: 'permission.create', description: 'Create permissions', module: 'permissions' },
      { name: 'permission.read', description: 'View permissions', module: 'permissions' },
      { name: 'permission.update', description: 'Update permissions', module: 'permissions' },
      { name: 'permission.delete', description: 'Delete permissions', module: 'permissions' },
      { name: 'product.create', description: 'Create products', module: 'products' },
      { name: 'product.read', description: 'View products', module: 'products' },
      { name: 'product.update', description: 'Update products', module: 'products' },
      { name: 'product.delete', description: 'Delete products', module: 'products' },
      { name: 'order.read', description: 'View orders', module: 'orders' },
      { name: 'order.update', description: 'Update orders', module: 'orders' },
      { name: 'order.delete', description: 'Delete orders', module: 'orders' },
      { name: 'admin.dashboard', description: 'Access admin dashboard', module: 'admin' },
    ];

    const createdPermissions = [];
    for (const perm of defaultPermissions) {
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

    // 3. Assign all permissions to Super Admin role
    console.log('\n📝 Assigning permissions to Super Admin role...');
    const allPermissions = await Permission.find({ status: 'active' });
    
    for (const permission of allPermissions) {
      const existing = await RolePermission.findOne({
        role_id: superAdminRole._id,
        permission_id: permission._id,
      });

      if (!existing) {
        await RolePermission.create({
          role_id: superAdminRole._id,
          permission_id: permission._id,
        });
      }
    }
    console.log(`✅ All permissions assigned to Super Admin role`);

    // 4. Create Super Admin User
    console.log('\n📝 Creating Super Admin user...');
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@ecommerce.com';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';
    const superAdminFirstName = process.env.SUPER_ADMIN_FIRST_NAME || 'Super';
    const superAdminLastName = process.env.SUPER_ADMIN_LAST_NAME || 'Admin';
    const superAdminPhone = process.env.SUPER_ADMIN_PHONE || null;

    // Check if user already exists
    const existingUser = await User.findByEmail(superAdminEmail);
    
    if (existingUser) {
      console.log('ℹ️  Super Admin user already exists');
      
      // Check if role is assigned
      const userRole = await UserRole.findOne({
        user_id: existingUser._id,
        role_id: superAdminRole._id,
      });

      if (!userRole) {
        await UserRole.create({
          user_id: existingUser._id,
          role_id: superAdminRole._id,
        });
        console.log('✅ Super Admin role assigned to existing user');
      } else {
        console.log('ℹ️  Super Admin role already assigned');
      }

      console.log('\n📋 Super Admin Credentials:');
      console.log(`   Email: ${superAdminEmail}`);
      if (superAdminPhone) console.log(`   Phone: ${superAdminPhone}`);
      console.log(`   Password: ${superAdminPassword}`);
      console.log('\n✅ Super Admin setup complete!');
      
      await mongooseConnection.disconnect();
      return;
    }

    // Create new user
    const hashedPassword = await hashPassword(superAdminPassword);
    const { encrypt } = require('../src/utils/encryption');
    const encryptedEmail = encrypt(superAdminEmail);
    const encryptedPhone = superAdminPhone ? encrypt(superAdminPhone) : null;
    
    const superAdminUser = await User.create({
      email: encryptedEmail,
      password: hashedPassword,
      phone: encryptedPhone,
      first_name: superAdminFirstName,
      last_name: superAdminLastName,
      status: 'active',
      is_email_verified: true,
      is_phone_verified: superAdminPhone ? true : false,
    });

    // Assign Super Admin role
    await UserRole.create({
      user_id: superAdminUser._id,
      role_id: superAdminRole._id,
    });

    console.log('✅ Super Admin user created successfully');

    console.log('\n📋 Super Admin Credentials:');
    console.log(`   Email: ${superAdminEmail}`);
    if (superAdminPhone) console.log(`   Phone: ${superAdminPhone}`);
    console.log(`   Password: ${superAdminPassword}`);
    console.log(`   User ID: ${superAdminUser._id}`);
    console.log('\n✅ Super Admin setup complete!');
    console.log('\n⚠️  Please change the default password after first login!');

    await mongooseConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
    await mongooseConnection.disconnect();
    process.exit(1);
  }
}

// Run the script
createSuperAdmin();

