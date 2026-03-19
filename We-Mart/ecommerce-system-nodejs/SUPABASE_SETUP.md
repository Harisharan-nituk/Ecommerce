# Supabase Image Storage Setup Guide

This guide will help you set up Supabase Storage for image uploads in the e-commerce system.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created
3. Node.js and npm installed

## Step 1: Get Supabase Credentials

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** (SUPABASE_URL)
   - **Service Role Key** (SUPABASE_SERVICE_KEY) - Keep this secret!
   - **Anon Key** (SUPABASE_ANON_KEY) - For public access

## Step 2: Configure Environment Variables

Add the following to your `.env` file in the project root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_BUCKET_NAME=product-images
```

**Important Security Notes:**
- Never commit your `.env` file to version control
- The `SUPABASE_SERVICE_KEY` has admin access - keep it secure
- Use `SUPABASE_ANON_KEY` in frontend applications

## Step 3: Create Storage Bucket

Run the setup script to create the bucket:

```bash
npm run setup:bucket
```

Or manually:

```bash
node scripts/create-supabase-bucket.js
```

This script will:
- Create a public bucket named `product-images` (or your configured name)
- Set file size limit to 5MB
- Allow image types: JPEG, PNG, WebP, GIF
- Test bucket access

### Manual Bucket Creation

If the script fails, you can create the bucket manually:

1. Go to Supabase Dashboard → **Storage**
2. Click **New bucket**
3. Name it: `product-images` (or your configured name)
4. Make it **Public**
5. Set file size limit: 5MB
6. Add allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

## Step 4: Verify Setup

After creating the bucket, verify it's accessible:

```bash
# Test the upload endpoint (requires authentication)
curl -X POST http://localhost:3001/api/v1/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@path/to/test-image.jpg" \
  -F "folder=products"
```

## API Endpoints

### Upload Single Image

```http
POST /api/v1/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  image: <file>
  folder: products (optional, defaults to 'products')
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "path": "products/abc123def456.jpg",
    "url": "https://your-project.supabase.co/storage/v1/object/public/product-images/products/abc123def456.jpg",
    "fileName": "abc123def456.jpg",
    "folder": "products"
  }
}
```

### Upload Multiple Images

```http
POST /api/v1/upload/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  images: <file1>, <file2>, ...
  folder: products (optional)
```

### Delete Image

```http
DELETE /api/v1/upload/image
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "filePath": "products/abc123def456.jpg"
}
```

## Product Image Upload

When creating or updating a product, you can include an image:

```http
POST /api/v1/products
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  name: "Product Name"
  description: "Product Description"
  price: 99.99
  stock: 100
  image: <file>
```

The image will be automatically uploaded to Supabase and the `image_url` will be set in the product.

## Folder Structure

Images are organized in folders:
- `products/` - Product images
- `users/` - User profile images (future)
- `categories/` - Category images (future)

## Troubleshooting

### Error: "Supabase is not configured"
- Check that all Supabase environment variables are set in `.env`
- Restart your server after adding environment variables

### Error: "Failed to create bucket"
- Verify your `SUPABASE_SERVICE_KEY` has storage admin permissions
- Check that the bucket name doesn't already exist
- Try creating the bucket manually in Supabase Dashboard

### Error: "Cannot access bucket"
- Ensure the bucket is set to **Public**
- Check bucket permissions in Supabase Dashboard
- Verify your service key is correct

### Images not loading
- Ensure the bucket is **Public**
- Check the URL format: `https://your-project.supabase.co/storage/v1/object/public/bucket-name/path/to/image.jpg`
- Verify CORS settings in Supabase Dashboard

## Security Best Practices

1. **Never expose Service Key**: Only use `SUPABASE_SERVICE_KEY` on the backend
2. **Use Anon Key in Frontend**: For public read access, use `SUPABASE_ANON_KEY`
3. **Validate File Types**: The system only accepts image files (JPEG, PNG, WebP, GIF)
4. **File Size Limits**: Maximum 5MB per file
5. **Authentication**: All upload endpoints require authentication and proper permissions

## Storage Limits

- Free tier: 1GB storage
- Pro tier: 100GB storage
- File size limit: 5MB per file (configurable)

## Support

For issues with Supabase Storage:
- Supabase Documentation: https://supabase.com/docs/guides/storage
- Supabase Discord: https://discord.supabase.com
