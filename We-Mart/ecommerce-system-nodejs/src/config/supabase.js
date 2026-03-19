const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || 'product-images';

// Validate configuration
if (!supabaseUrl || !supabaseServiceKey) {
  logger.warn('Supabase configuration missing. Image uploads will not work.');
  logger.warn('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file');
}

// Create Supabase client with service key (for admin operations)
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Create public client (for frontend use)
const supabasePublic = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Get Supabase client (admin)
 */
function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file');
  }
  return supabase;
}

/**
 * Get public Supabase client
 */
function getPublicClient() {
  if (!supabasePublic) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
  }
  return supabasePublic;
}

/**
 * Check if Supabase is configured
 */
function isConfigured() {
  return !!(supabaseUrl && supabaseServiceKey);
}

/**
 * Get public URL for an image
 */
function getPublicUrl(filePath) {
  if (!supabaseUrl || !bucketName) {
    return null;
  }
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
}

/**
 * Get signed URL for private images (expires in 1 hour by default)
 */
async function getSignedUrl(filePath, expiresIn = 3600) {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    logger.error('Error creating signed URL:', error);
    throw error;
  }
}

module.exports = {
  supabase,
  supabasePublic,
  bucketName,
  getSupabaseClient,
  getPublicClient,
  isConfigured,
  getPublicUrl,
  getSignedUrl
};
