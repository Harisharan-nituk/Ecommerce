/**
 * Script to check seller applications in database
 * Run: node scripts/check-seller-applications.js
 */

require('dotenv').config();
const mongooseConnection = require('../src/config/mongoose');
const { SellerApplication, User } = require('../src/models/mongoose');

async function checkSellerApplications() {
  try {
    console.log('🔍 Checking seller applications...\n');

    // Connect to MongoDB
    await mongooseConnection.connect();
    
    if (!mongooseConnection.isConnected()) {
      throw new Error('Failed to connect to MongoDB');
    }

    // Get all seller applications
    const applications = await SellerApplication.find({})
      .populate('user_id', 'first_name last_name email')
      .lean();

    console.log(`📊 Total seller applications: ${applications.length}\n`);

    if (applications.length === 0) {
      console.log('⚠️  No seller applications found in database.');
      console.log('   This could mean:');
      console.log('   1. No one has registered as a seller yet');
      console.log('   2. The registration form is not working correctly');
      console.log('   3. The seller applications are in a different collection');
    } else {
      applications.forEach((app, index) => {
        console.log(`\n📋 Application ${index + 1}:`);
        console.log(`   ID: ${app._id}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Business Name: ${app.business_name}`);
        console.log(`   User ID: ${app.user_id?._id || app.user_id || 'NOT FOUND'}`);
        if (app.user_id && app.user_id._id) {
          console.log(`   User Name: ${app.user_id.first_name} ${app.user_id.last_name}`);
          console.log(`   User Email: ${app.user_id.email || 'N/A'}`);
        } else if (app.user_id) {
          // Try to find user by ID
          User.findById(app.user_id).then(user => {
            if (user) {
              console.log(`   User Name: ${user.first_name} ${user.last_name}`);
            }
          }).catch(() => {});
        }
        console.log(`   Created: ${new Date(app.created_at).toLocaleString()}`);
      });
    }

    // Check for users without seller applications
    const allUsers = await User.find({}).lean();
    console.log(`\n👥 Total users: ${allUsers.length}`);
    
    const usersWithApps = applications.map(app => {
      if (app.user_id && app.user_id._id) {
        return app.user_id._id.toString();
      } else if (app.user_id) {
        return app.user_id.toString();
      }
      return null;
    }).filter(Boolean);

    console.log(`📝 Users with seller applications: ${usersWithApps.length}`);
    console.log(`   User IDs: ${usersWithApps.join(', ')}`);

    await mongooseConnection.disconnect();
    console.log('\n✅ Check complete!');
  } catch (error) {
    console.error('❌ Error checking seller applications:', error);
    await mongooseConnection.disconnect();
    process.exit(1);
  }
}

// Run the script
checkSellerApplications();

