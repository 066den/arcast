# AWS S3 / DigitalOcean Spaces Setup Guide

This guide will help you configure video and photo uploads through AWS S3 (DigitalOcean Spaces) for your Arcast application.

## Prerequisites

1. DigitalOcean account with Spaces enabled
2. AWS CLI installed (for configuration)
3. Your application running locally

## Step 1: Create DigitalOcean Space

1. Log into your DigitalOcean dashboard
2. Navigate to "Spaces" in the left sidebar
3. Click "Create a Space"
4. Choose a name (e.g., `arcast-s3`)
5. Select region (e.g., `blr1` for Bangalore)
6. Choose "Restrict File Listing" for security
7. Click "Create a Space"

## Step 2: Generate API Keys

1. In your DigitalOcean dashboard, go to "API" section
2. Click "Generate New Key"
3. Give it a name (e.g., `arcast-spaces-key`)
4. Copy the **Access Key** and **Secret Key**
5. Keep these secure - you'll need them for configuration

## Step 3: Configure AWS CLI

Run these commands in your terminal to configure AWS CLI for DigitalOcean Spaces:

```bash
# Configure AWS CLI with DigitalOcean Spaces
aws --profile do-tor1 configure set aws_access_key_id YOUR_ACCESS_KEY
aws --profile do-tor1 configure set aws_secret_access_key YOUR_SECRET_KEY
aws --profile do-tor1 configure set region blr1
aws --profile do-tor1 configure set endpoint_url https://blr1.digitaloceanspaces.com

# Test the configuration
aws --profile do-tor1 s3 ls s3://arcast-s3
```

## Step 4: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# AWS S3 / DigitalOcean Spaces Configuration
AWS_REGION="blr1"
AWS_ENDPOINT="https://blr1.digitaloceanspaces.com"
AWS_ACCESS_KEY_ID="your-digitalocean-spaces-access-key"
AWS_SECRET_ACCESS_KEY="your-digitalocean-spaces-secret-key"
AWS_S3_BUCKET_NAME="arcast-s3"
```

Replace the placeholder values with your actual DigitalOcean Spaces credentials.

## Step 5: Test the Setup

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Test image upload through your existing studio creation form
3. Test video upload using the new API endpoint: `POST /api/upload/video`

## Step 6: File Organization

Your files will be organized in the following structure in DigitalOcean Spaces:

```
arcast-s3/
├── images/
│   ├── studios/
│   ├── blog/
│   └── equipment/
├── videos/
│   ├── samples/
│   └── content/
├── audio/
│   └── recordings/
└── documents/
    └── contracts/
```

## API Endpoints

### Upload Image

- **Endpoint**: Existing studio/image endpoints
- **Method**: POST
- **Body**: FormData with `imageFile`

### Upload Video

- **Endpoint**: `/api/upload/video`
- **Method**: POST
- **Body**: FormData with `videoFile`

### Upload Generic File

- **Endpoint**: `/api/upload/file`
- **Method**: POST
- **Body**: FormData with:
  - `file`: The file to upload
  - `fileType`: 'image' | 'video' | 'audio' | 'document'
  - `folder`: Optional folder name

## File Validation

The system validates files based on type:

- **Images**: JPEG, JPG, PNG, WebP (max 5MB)
- **Videos**: MP4, WebM, OGG, AVI, MOV, QuickTime (max 100MB)
- **Audio**: MPEG, WAV, AAC, OGG (max 50MB)
- **Documents**: PDF, DOC (max 10MB)

## Security Features

1. **Public Read Access**: Files are uploaded with public read permissions
2. **Unique Filenames**: UUID-based naming prevents conflicts
3. **File Type Validation**: Only allowed file types are accepted
4. **Size Limits**: Prevents oversized uploads
5. **Metadata Tracking**: Original filename and upload timestamp stored

## Migration from Local Storage

If you have existing files in local storage, you can:

1. Keep the current `deleteUploadedFile` function for backward compatibility
2. Gradually migrate files to S3
3. Update database URLs to point to S3 URLs

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check your AWS credentials and bucket permissions
2. **Connection Timeout**: Verify your endpoint URL and region
3. **File Not Found**: Ensure the bucket name matches your environment variable

### Debug Commands

```bash
# List all files in your space
aws --profile do-tor1 s3 ls s3://arcast-s3 --recursive

# Check space permissions
aws --profile do-tor1 s3api get-bucket-acl --bucket arcast-s3

# Test upload
aws --profile do-tor1 s3 cp test-file.txt s3://arcast-s3/test/
```

## Production Deployment

For production deployment:

1. Set environment variables in your hosting platform
2. Ensure your DigitalOcean Space is in the same region as your app
3. Consider using CDN for better performance
4. Set up monitoring for upload failures

## Cost Optimization

- DigitalOcean Spaces pricing is based on storage and bandwidth
- Consider implementing file cleanup for temporary uploads
- Use appropriate file compression for images and videos
- Monitor usage through DigitalOcean dashboard

## Support

If you encounter issues:

1. Check DigitalOcean Spaces documentation
2. Verify your AWS CLI configuration
3. Test with a simple file upload first
4. Check browser network tab for detailed error messages
