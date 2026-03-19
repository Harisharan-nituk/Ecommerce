/**
 * Script to fix Madhu's role - assign correct Vendor/Seller role
 * Run: node scripts/fix-madhu-role.js
 */

require('dotenv').config();
const mongooseConnection = require('../src/config/mongoose');
const { User, UserRole, Role } = require('../src/models/mongoose');

async function fixMadhuRole() {
  try {
    console.log('🔧 Fixing Madhu\'s role...\n');

    // Connect to MongoDB
    await mongooseConnection.connect();
    
    if (!mongooseConnection.isConnected()) {
      throw new Error('Failed to connect to MongoDB');
    }

    // 1. Find Madhu
    const madhu = await User.findOne({ 
      $or: [
        { first_name: /madhu/i },
        { last_name: /madhu/i },
      ]
    });

    if (!madhu) {
      console.log('⚠️  User "Madhu" not found');
      await mongooseConnection.disconnect();
      return;
    }

    console.log(`✅ Found user: ${madhu.first_name} ${madhu.last_name}`);
    console.log(`   ID: ${madhu._id}`);

    // 2. Get current roles
    const currentRoles = await UserRole.find({ user_id: madhu._id })
      .populate('role_id', 'name')
      .lean();

    console.log(`\n📋 Current roles (${currentRoles.length}):`);
    currentRoles.forEach(ur => {
      if (ur.role_id) {
        console.log(`   - ${ur.role_id.name}`);
      }
    });

    // 3. Get Vendor/Seller role
    const sellerRole = await Role.findOne({ name: 'Vendor/Seller' });
    if (!sellerRole) {
      console.log('❌ Vendor/Seller role not found. Please run fix-seller-permissions.js first.');
      await mongooseConnection.disconnect();
      return;
    }

    console.log(`\n✅ Found Vendor/Seller role: ${sellerRole.name}`);

    // 4. Remove all existing roles (or just the wrong ones)
    const wrongRoles = currentRoles.filter(ur => 
      ur.role_id && (
        ur.role_id.name === 'Seller : Partner' ||
        ur.role_id.name === 'Seller' ||
        ur.role_id.name.includes('Seller')
      )
    );

    if (wrongRoles.length > 0) {
      for (const wrongRole of wrongRoles) {
        await UserRole.deleteOne({ _id: wrongRole._id });
        console.log(`   🗑️  Removed role: ${wrongRole.role_id.name}`);
      }
    }

    // 5. Check if Vendor/Seller role is already assigned
    const hasVendorSeller = await UserRole.findOne({
      user_id: madhu._id,
      role_id: sellerRole._id,
    });

    if (!hasVendorSeller) {
      // Assign Vendor/Seller role
      const userRole = new UserRole({
        user_id: madhu._id,
        role_id: sellerRole._id,
        created_at: new Date(),
      });
      await userRole.save();
      console.log(`   ✅ Assigned Vendor/Seller role`);
    } else {
      console.log(`   ℹ️  Vendor/Seller role already assigned`);
    }

    // 6. Verify final roles
    const finalRoles = await UserRole.find({ user_id: madhu._id })
      .populate('role_id', 'name')
      .lean();

    console.log(`\n📋 Final roles (${finalRoles.length}):`);
    finalRoles.forEach(ur => {
      if (ur.role_id) {
        console.log(`   ✅ ${ur.role_id.name}`);
      }
    });

    await mongooseConnection.disconnect();
    console.log('\n✅ Fix complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Madhu should logout and login again');
    console.log('   2. Madhu will now have only the 5 correct seller permissions:');
    console.log('      • vendor.product.manage_own');
    console.log('      • vendor.order.manage_own');
    console.log('      • vendor.report.own_sales');
    console.log('      • product.read');
    console.log('      • order.read');
  } catch (error) {
    console.error('❌ Error fixing Madhu\'s role:', error);
    await mongooseConnection.disconnect();
    process.exit(1);
  }
}

// Run the script
fixMadhuRole();

