const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || 'product-images';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env');
  console.error('\nRequired environment variables:');
  console.error('  SUPABASE_URL=your-supabase-project-url');
  console.error('  SUPABASE_SERVICE_KEY=your-supabase-service-role-key');
  console.error('  SUPABASE_BUCKET_NAME=product-images (optional, defaults to "product-images")');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucket() {
  console.log('🚀 Creating Supabase Storage Bucket...\n');
  console.log(`Bucket Name: ${bucketName}`);
  console.log(`Supabase URL: ${supabaseUrl}\n`);

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const bucketExists = buckets.some(bucket => bucket.name === bucketName);

    if (bucketExists) {
      console.log(`✅ Bucket "${bucketName}" already exists!`);
      
      // Get bucket details
      const bucket = buckets.find(b => b.name === bucketName);
      console.log('\n📋 Bucket Details:');
      console.log(`   Name: ${bucket.name}`);
      console.log(`   ID: ${bucket.id}`);
      console.log(`   Created: ${bucket.created_at}`);
      console.log(`   Public: ${bucket.public ? 'Yes' : 'No'}`);
      
      // Check if bucket is public, if not, try to make it public
      if (!bucket.public) {
        console.log('\n⚠️  Bucket is not public. Attempting to update...');
        const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
          public: true
        });
        
        if (updateError) {
          console.log('⚠️  Could not make bucket public automatically.');
          console.log('   Please make it public manually in Supabase Dashboard');
        } else {
          console.log('✅ Bucket is now public!');
        }
      }
      
      return bucket;
    }

    // Create new bucket
    console.log(`📦 Creating bucket "${bucketName}"...`);
    
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true, // Make bucket public so images can be accessed
      fileSizeLimit: 5242880, // 5MB limit
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });

    if (error) {
      // If bucket creation fails, try without options
      console.log('⚠️  First attempt failed, trying with minimal options...');
      const { data: data2, error: error2 } = await supabase.storage.createBucket(bucketName, {
        public: true
      });

      if (error2) {
        throw new Error(`Failed to create bucket: ${error2.message}`);
      }

      console.log('✅ Bucket created successfully (with basic settings)!');
      return data2;
    }

    console.log('✅ Bucket created successfully!');
    console.log('\n📋 Bucket Details:');
    console.log(`   Name: ${data.name}`);
    console.log(`   Public: Yes`);
    console.log(`   File Size Limit: 5MB`);
    console.log(`   Allowed Types: JPEG, PNG, WebP, GIF`);

    return data;
  } catch (error) {
    console.error('❌ Error creating bucket:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Verify your SUPABASE_SERVICE_KEY has storage admin permissions');
    console.error('2. Check that SUPABASE_URL is correct');
    console.error('3. Ensure you have the correct Supabase project access');
    console.error('\n📝 Manual Creation:');
    console.error('You can also create the bucket manually:');
    console.error('1. Go to: https://supabase.com/dashboard');
    console.error('2. Select your project');
    console.error('3. Navigate to Storage');
    console.error(`4. Click "New bucket" and name it: ${bucketName}`);
    console.error('5. Make it public');
    
    process.exit(1);
  }
}

async function testBucketAccess() {
  console.log('\n🧪 Testing bucket access...');
  
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });

    if (error) {
      throw new Error(`Cannot access bucket: ${error.message}`);
    }

    console.log('✅ Bucket is accessible!');
    console.log(`   Files in bucket: ${data.length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Cannot access bucket:', error.message);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   Supabase Storage Bucket Setup');
  console.log('═══════════════════════════════════════════════════\n');

  const bucket = await createBucket();
  
  if (bucket) {
    const accessible = await testBucketAccess();
    
    if (accessible) {
      console.log('\n✅ Setup Complete!');
      console.log('\n📝 Next Steps:');
      console.log(`1. Ensure SUPABASE_BUCKET_NAME=${bucketName} is set in .env`);
      console.log('2. Restart your backend server');
      console.log('3. Test image upload via POST /api/v1/upload/image endpoint');
      console.log('\n🔗 Bucket URL:');
      console.log(`   ${supabaseUrl}/storage/v1/object/public/${bucketName}/`);
      console.log('\n📚 API Endpoints:');
      console.log('   POST /api/v1/upload/image - Upload single image');
      console.log('   POST /api/v1/upload/images - Upload multiple images');
      console.log('   DELETE /api/v1/upload/image - Delete image');
    }
  }

  console.log('\n═══════════════════════════════════════════════════\n');
}

main();
