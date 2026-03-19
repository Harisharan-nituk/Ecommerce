require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8080';
const TEST_EMAIL = 'testuser@example.com';
const TEST_PASSWORD = 'Test@1234';
const TEST_MOBILE = '9876543210';

async function testSignup() {
  console.log('\n📝 Testing Signup...\n');
  
  try {
    const response = await axios.post(`${API_GATEWAY_URL}/gateway/auth/register`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      first_name: 'Test',
      last_name: 'User',
      phone: TEST_MOBILE,
    });

    if (response.data.success) {
      console.log('✅ Signup Successful!');
      console.log('   User IAM UUID:', response.data.data.iam_uuid);
      console.log('   Email:', response.data.data.email);
      return response.data.data;
    } else {
      console.log('❌ Signup Failed:', response.data.message);
      return null;
    }
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️  User already exists, continuing with login test...');
      return { email: TEST_EMAIL, password: TEST_PASSWORD };
    }
    console.log('❌ Signup Error:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testLogin(email, password) {
  console.log('\n🔐 Testing Login...\n');
  
  try {
    const response = await axios.post(`${API_GATEWAY_URL}/gateway/auth/login`, {
      email: email,
      password: password,
    });

    if (response.data.success) {
      console.log('✅ Login Successful!');
      console.log('   Token:', response.data.data.token.substring(0, 50) + '...');
      console.log('   User:', response.data.data.user.email);
      console.log('   Roles:', response.data.data.roles);
      return response.data.data.token;
    } else {
      console.log('❌ Login Failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Login Error:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testSuperAdminLogin() {
  console.log('\n👑 Testing Super Admin Login...\n');
  
  try {
    const response = await axios.post(`${API_GATEWAY_URL}/gateway/auth/login`, {
      email: 'harisharan284@gmail.com',
      password: 'Hari@1801',
    });

    if (response.data.success) {
      console.log('✅ Super Admin Login Successful!');
      console.log('   Token:', response.data.data.token.substring(0, 50) + '...');
      console.log('   User:', response.data.data.user.email);
      console.log('   Roles:', response.data.data.roles);
      return response.data.data.token;
    } else {
      console.log('❌ Super Admin Login Failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Super Admin Login Error:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testProfile(token) {
  console.log('\n👤 Testing Get Profile...\n');
  
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/gateway/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      console.log('✅ Profile Retrieved Successfully!');
      console.log('   User:', response.data.data.email);
      console.log('   IAM UUID:', response.data.data.iam_uuid);
      return true;
    } else {
      console.log('❌ Profile Failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Profile Error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('     LOGIN & SIGNUP TESTING');
  console.log('═══════════════════════════════════════════════════════');

  // Test 1: Signup
  const signupResult = await testSignup();
  
  // Test 2: Login with test user
  if (signupResult) {
    const loginToken = await testLogin(signupResult.email || TEST_EMAIL, signupResult.password || TEST_PASSWORD);
    if (loginToken) {
      await testProfile(loginToken);
    }
  }

  // Test 3: Super Admin Login
  const superAdminToken = await testSuperAdminLogin();
  if (superAdminToken) {
    await testProfile(superAdminToken);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('     TESTING COMPLETE');
  console.log('═══════════════════════════════════════════════════════\n');
}

// Run tests
runTests().catch(error => {
  console.error('Test execution error:', error);
  process.exit(1);
});

