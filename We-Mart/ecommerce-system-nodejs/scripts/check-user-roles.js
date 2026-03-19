/**
 * Script to check user roles and permissions
 * Run: node scripts/check-user-roles.js
 */

require('dotenv').config();
const mongooseConnection = require('../src/config/mongoose');
const { User, UserRole, Role, RolePermission, Permission } = require('../src/models/mongoose');

async function checkUserRoles() {
  try {
    console.log('🔍 Checking user roles and permissions...\n');

    // Connect to MongoDB
    await mongooseConnection.connect();
    
    if (!mongooseConnection.isConnected()) {
      throw new Error('Failed to connect to MongoDB');
    }

    // Find user named Madhu
    const users = await User.find({ 
      $or: [
        { first_name: /madhu/i },
        { last_name: /madhu/i },
      ]
    }).lean();

    if (users.length === 0) {
      console.log('⚠️  No user named "Madhu" found. Checking all users...\n');
      const allUsers = await User.find({}).limit(10).lean();
      users.push(...allUsers);
    }

    for (const user of users) {
      console.log(`\n👤 User: ${user.first_name} ${user.last_name}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Status: ${user.status}`);

      // Get user roles
      const userRoles = await UserRole.find({ user_id: user._id })
        .populate('role_id', 'name description')
        .lean();

      if (userRoles.length === 0) {
        console.log('   ⚠️  No roles assigned');
      } else {
        console.log(`   📋 Roles (${userRoles.length}):`);
        for (const ur of userRoles) {
          const role = ur.role_id;
          if (role) {
            console.log(`      - ${role.name}: ${role.description || 'No description'}`);
            
            // Get permissions for this role
            const rolePerms = await RolePermission.find({ role_id: role._id })
              .populate('permission_id', 'name')
              .lean();
            
            const permNames = rolePerms
              .map(rp => rp.permission_id?.name)
              .filter(Boolean)
              .sort();
            
            console.log(`        Permissions (${permNames.length}):`);
            permNames.forEach(perm => {
              console.log(`          • ${perm}`);
            });
          } else {
            console.log(`      - Role ID: ${ur.role_id} (not found)`);
          }
        }
      }
    }

    // Check Vendor/Seller role
    console.log('\n\n📋 Vendor/Seller Role Status:');
    const sellerRole = await Role.findOne({ name: 'Vendor/Seller' });
    if (sellerRole) {
      console.log(`   ✅ Role exists: ${sellerRole.name}`);
      console.log(`   Description: ${sellerRole.description}`);
      
      const rolePerms = await RolePermission.find({ role_id: sellerRole._id })
        .populate('permission_id', 'name')
        .lean();
      
      const permNames = rolePerms
        .map(rp => rp.permission_id?.name)
        .filter(Boolean)
        .sort();
      
      console.log(`   Permissions (${permNames.length}):`);
      permNames.forEach(perm => {
        console.log(`     • ${perm}`);
      });
    } else {
      console.log('   ⚠️  Vendor/Seller role not found');
    }

    await mongooseConnection.disconnect();
    console.log('\n✅ Check complete!');
  } catch (error) {
    console.error('❌ Error checking user roles:', error);
    await mongooseConnection.disconnect();
    process.exit(1);
  }
}

// Run the script
checkUserRoles();

