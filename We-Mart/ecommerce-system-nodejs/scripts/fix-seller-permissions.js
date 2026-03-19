/**
 * Script to fix Vendor/Seller role permissions
 * Removes admin permissions and ensures only seller-specific permissions
 * Run: node scripts/fix-seller-permissions.js
 */

require('dotenv').config();
const mongooseConnection = require('../src/config/mongoose');
const { Role, Permission, RolePermission, UserRole, User } = require('../src/models/mongoose');

async function fixSellerPermissions() {
  try {
    console.log('🔧 Fixing Vendor/Seller role permissions...\n');

    // Connect to MongoDB
    await mongooseConnection.connect();
    
    if (!mongooseConnection.isConnected()) {
      throw new Error('Failed to connect to MongoDB');
    }

    // 1. Find or create Vendor/Seller role
    let sellerRole = await Role.findOne({ name: 'Vendor/Seller' });
    if (!sellerRole) {
      const now = new Date();
      sellerRole = new Role({
        name: 'Vendor/Seller',
        description: 'Vendor/Seller role for managing own products and orders',
        status: 'active',
        created_at: now,
        updated_at: now,
      });
      await sellerRole.save();
      console.log('✅ Created Vendor/Seller role');
    } else {
      console.log('✅ Found Vendor/Seller role');
    }

    // 2. Define correct seller permissions (only these 5)
    const correctSellerPermissions = [
      'vendor.product.manage_own',
      'vendor.order.manage_own',
      'vendor.report.own_sales',
      'product.read',
      'order.read',
    ];

    // 3. Get permission IDs
    const permissions = await Permission.find({ 
      name: { $in: correctSellerPermissions },
      status: 'active'
    });

    if (permissions.length !== correctSellerPermissions.length) {
      console.log('⚠️  Warning: Some permissions not found!');
      console.log('   Expected:', correctSellerPermissions);
      console.log('   Found:', permissions.map(p => p.name));
    }

    // 4. Remove ALL existing permissions from Vendor/Seller role
    const removed = await RolePermission.deleteMany({ role_id: sellerRole._id });
    console.log(`🗑️  Removed ${removed.deletedCount} existing permissions from Vendor/Seller role`);

    // 5. Assign only the correct permissions
    let assignedCount = 0;
    for (const permission of permissions) {
      const rolePermission = new RolePermission({
        role_id: sellerRole._id,
        permission_id: permission._id,
        created_at: new Date(),
      });
      await rolePermission.save();
      assignedCount++;
      console.log(`   ✅ Assigned: ${permission.name}`);
    }

    console.log(`\n✅ Assigned ${assignedCount} correct permissions to Vendor/Seller role`);

    // 6. Check users with Vendor/Seller role
    const userRoles = await UserRole.find({ role_id: sellerRole._id })
      .populate('user_id', 'first_name last_name email')
      .lean();

    console.log(`\n👥 Users with Vendor/Seller role: ${userRoles.length}`);
    if (userRoles.length > 0) {
      userRoles.forEach((ur, idx) => {
        if (ur.user_id) {
          console.log(`   ${idx + 1}. ${ur.user_id.first_name} ${ur.user_id.last_name} (${ur.user_id.email || 'N/A'})`);
        } else {
          console.log(`   ${idx + 1}. User ID: ${ur.user_id}`);
        }
      });
      console.log('\n💡 These users will now have the correct seller permissions after they logout and login again.');
    }

    // 7. Check for users with wrong permissions (users with admin permissions but Vendor/Seller role)
    console.log('\n🔍 Checking for users with incorrect permissions...');
    const allUsers = await User.find({}).lean();
    let foundIssues = false;

    for (const user of allUsers) {
      const userRolesList = await UserRole.find({ user_id: user._id })
        .populate('role_id', 'name')
        .lean();
      
      const roleNames = userRolesList.map(ur => ur.role_id?.name).filter(Boolean);
      
      if (roleNames.includes('Vendor/Seller')) {
        // Get user permissions
        const userPermissions = await getUserPermissions(user._id);
        const adminPerms = userPermissions.filter(p => 
          p.startsWith('user.') || 
          p.startsWith('role.') || 
          p.startsWith('permission.')
        );
        
        if (adminPerms.length > 0) {
          foundIssues = true;
          console.log(`\n⚠️  User: ${user.first_name} ${user.last_name}`);
          console.log(`   Roles: ${roleNames.join(', ')}`);
          console.log(`   Has admin permissions: ${adminPerms.join(', ')}`);
          console.log(`   💡 This user needs to logout and login again to refresh permissions.`);
        }
      }
    }

    if (!foundIssues) {
      console.log('✅ No users found with incorrect permissions');
    }

    await mongooseConnection.disconnect();
    console.log('\n✅ Fix complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Users with Vendor/Seller role should logout and login again');
    console.log('   2. They will now have only the 5 correct seller permissions');
    console.log('   3. Check admin panel to verify permissions are correct');
  } catch (error) {
    console.error('❌ Error fixing seller permissions:', error);
    await mongooseConnection.disconnect();
    process.exit(1);
  }
}

async function getUserPermissions(userId) {
  const userRoles = await UserRole.find({ user_id: userId })
    .populate('role_id', 'name')
    .lean();

  const roleIds = userRoles.map(ur => ur.role_id._id).filter(Boolean);
  
  const rolePermissions = await RolePermission.find({ role_id: { $in: roleIds } })
    .populate('permission_id', 'name')
    .lean();

  return rolePermissions
    .map(rp => rp.permission_id?.name)
    .filter(Boolean);
}

// Run the script
fixSellerPermissions();

