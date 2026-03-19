// Try to load .env from multiple locations
const path = require('path');
const fs = require('fs');

// Try current directory first, then parent directory
const envPaths = [
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env'),
  path.join(process.cwd(), '.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    break;
  }
}

// If still no MONGODB_CONNECTION_STRING, use default
if (!process.env.MONGODB_CONNECTION_STRING) {
  process.env.MONGODB_CONNECTION_STRING = 'mongodb+srv://harisharan284_db_user:Placement40lpa@backend-development.pfqwa4a.mongodb.net/portfolioDB?retryWrites=true&w=majority';
}
const mongoose = require('mongoose');
const { hashPassword } = require('../src/utils/encryption');
const User = require('../src/models/User');
const Role = require('../src/models/Role');
const logger = require('../src/utils/logger');

const createSuperAdmin = async () => {
  const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING;
  const SUPER_ADMIN_EMAIL = 'harisharan284@gmail.com';
  const SUPER_ADMIN_MOBILE = '8447173197';
  const SUPER_ADMIN_PASSWORD = 'Hari@1801';
  const SUPER_ADMIN_FIRST_NAME = 'Harisharan';
  const SUPER_ADMIN_LAST_NAME = 'Admin';

  if (!MONGODB_CONNECTION_STRING) {
    logger.error('MONGODB_CONNECTION_STRING is not defined in .env');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_CONNECTION_STRING, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('✅ Connected to MongoDB for Super Admin creation.');

    // 1. Create or get 'Super Admin' role
    let superAdminRole = await Role.findOne({ name: 'Super Admin' });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'Super Admin',
        description: 'Has full access to all system functionalities.',
        permissions: [],
      });
      logger.info('✅ Created Super Admin role.');
    } else {
      logger.info('✅ Super Admin role already exists.');
    }

    // 2. Check if user already exists by email or mobile
    let superAdminUser = await User.findByEmail(SUPER_ADMIN_EMAIL);

    if (!superAdminUser) {
      // Check by mobile
      superAdminUser = await User.findByMobile(SUPER_ADMIN_MOBILE);
    }

    if (!superAdminUser) {
      // Create new Super Admin user
      // User.createUser handles encryption automatically
      superAdminUser = await User.createUser({
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD, // Will be hashed in createUser
        mobile_number: SUPER_ADMIN_MOBILE,
        role_id: superAdminRole._id,
        first_name: SUPER_ADMIN_FIRST_NAME,
        last_name: SUPER_ADMIN_LAST_NAME,
        user_name: 'superadmin',
        user_type: 'admin',
        status: 'active',
        is_email_verified: true,
        is_phone_verified: true,
      });

      logger.info(`✅ Created Super Admin user: ${SUPER_ADMIN_EMAIL}`);
      logger.info(`   IAM UUID: ${superAdminUser.iam_uuid}`);
      logger.info(`   Mobile: ${SUPER_ADMIN_MOBILE}`);
    } else {
      // Update existing user
      const hashedPassword = await hashPassword(SUPER_ADMIN_PASSWORD);
      superAdminUser.password = hashedPassword;
      superAdminUser.role_id = superAdminRole._id;
      superAdminUser.status = 'active';
      superAdminUser.is_email_verified = true;
      superAdminUser.is_phone_verified = true;
      await superAdminUser.save();
      
      logger.info(`✅ Updated existing user to Super Admin: ${SUPER_ADMIN_EMAIL}`);
      logger.info(`   IAM UUID: ${superAdminUser.iam_uuid}`);
    }

    logger.info('\n📋 Super Admin Credentials:');
    logger.info(`   Email: ${SUPER_ADMIN_EMAIL}`);
    logger.info(`   Mobile: ${SUPER_ADMIN_MOBILE}`);
    logger.info(`   Password: ${SUPER_ADMIN_PASSWORD}`);
    logger.info(`   IAM UUID: ${superAdminUser.iam_uuid}`);
    logger.info('\n✅ Super Admin setup complete!');
  } catch (error) {
    logger.error('❌ Error creating Super Admin:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB.');
  }
};

// Run the script
if (require.main === module) {
  createSuperAdmin();
}

module.exports = createSuperAdmin;

