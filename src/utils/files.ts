import { v4 as uuidv4 } from 'uuid'
import { unlink, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

/**
 * Upload a file to S3 storage
 * @param file - The file to upload
 * @param nameDir - Directory name for organization (e.g., 'images', 'videos', 'studios')
 * @returns Promise<string> - The public URL of the uploaded file
 */
export const getUploadedFile = async (
  file: File,
  nameDir: string = 'images'
): Promise<string> => {
  try {
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    // Write to local uploads directory
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadDir = join(process.cwd(), 'public', 'uploads', nameDir)
    const uploadPath = join(uploadDir, fileName)

    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true })
    await writeFile(uploadPath, buffer)

    // Return URL path
    return `/uploads/${nameDir}/${fileName}`
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload file')
  }
}

/**
 * Delete a file from local uploads directory
 * @param fileUrl - The URL of the file to delete
 * @returns Promise<boolean> - Success status
 */
export const deleteUploadedFile = async (fileUrl: string): Promise<boolean> => {
  try {
    const { isS3Url, extractFileKeyFromUrl, deleteFromS3 } = await import(
      '@/lib/s3'
    )

    if (isS3Url(fileUrl)) {
      const key = extractFileKeyFromUrl(fileUrl)
      if (key) {
        const deleted = await deleteFromS3(key)
        if (deleted) return true
      }
    }
  } catch (error) {
    console.error('Error deleting file from S3:', error)
  }

  try {
    const urlPath = fileUrl.replace(/^\/uploads\//, '')
    const filePath = join(process.cwd(), 'public', 'uploads', urlPath)
    await unlink(filePath)
    return true
  } catch (error) {
    console.error('Error deleting local file:', error)
    return false
  }
}

/**
 * Upload a video file to S3 using presigned POST for better performance
 * @param file - The video file to upload
 * @param nameDir - Directory name for organization
 * @returns Promise<string> - The public URL of the uploaded video
 */
export const getUploadedVideo = async (
  file: File,
  nameDir: string = 'videos'
): Promise<string> => {
  try {
    console.log('🚀 Starting video upload with presigned POST...', {
      fileName: file.name,
      fileSize: file.size,
      folder: nameDir,
    })

    const formData = new FormData()
    formData.append('videoFile', file)
    formData.append('folder', nameDir)

    // Optimized strategy based on file size:
    // < 100MB: presigned POST (fast)
    // 100-300MB: direct upload (reliable)
    // > 300MB: direct upload with multipart (fastest for huge files)
    const usePresignedPost = file.size < 100 * 1024 * 1024
    formData.append('usePresignedPost', usePresignedPost.toString())

    let uploadMethod = 'direct upload'
    if (file.size < 100 * 1024 * 1024) {
      uploadMethod = 'presigned POST (small file)'
    } else if (file.size > 300 * 1024 * 1024) {
      uploadMethod = 'multipart upload (very large file)'
    } else {
      uploadMethod = 'direct upload (medium file)'
    }

    const response = await fetch('/api/upload/video', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      let errorMessage = 'Failed to upload video'

      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (parseError) {
        // If response is not JSON, use status text or default message
        errorMessage = response.statusText || errorMessage
      }

      // Add status code to error message for better debugging
      throw new Error(`${response.status}: ${errorMessage}`)
    }

    const result = await response.json()
    console.log('✅ API Response received:', {
      uploadMethod: result.uploadMethod,
      hasPresignedPost: !!result.presignedPost,
      fileKey: result.presignedPost?.fileKey,
    })

    // Handle presigned POST response
    if (result.presignedPost) {
      console.log('🔄 Starting direct S3 upload...')

      // Upload directly to S3 using presigned POST
      const uploadFormData = new FormData()

      // Add only required presigned fields (exclude metadata)
      const requiredFields = [
        'key',
        'acl',
        'Content-Type',
        'Policy',
        'X-Amz-Algorithm',
        'X-Amz-Credential',
        'X-Amz-Date',
        'X-Amz-Signature',
      ]

      Object.entries(result.presignedPost.fields).forEach(([key, value]) => {
        if (requiredFields.includes(key)) {
          uploadFormData.append(key, value as string)
          console.log(`📝 Added field: ${key}`)
        } else {
          console.log(`⚠️ Skipped metadata field: ${key}`)
        }
      })

      // Add the file last
      uploadFormData.append('file', file)
      console.log('📁 Added file to upload form')

      console.log('🚀 Uploading to S3...')
      console.log('🔗 S3 URL:', result.presignedPost.url)
      console.log(
        '📊 FormData entries:',
        Array.from(uploadFormData.entries()).map(([key, value]) =>
          key === 'file' ? `${key}: [File ${file.name}]` : `${key}: ${value}`
        )
      )

      try {
        // Add progress tracking for large files
        const uploadPromise = fetch(result.presignedPost.url, {
          method: 'POST',
          body: uploadFormData,
        })

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error('S3 upload timeout after 10 minutes')),
            600000 // 10 minutes for very large files
          )
        })

        console.log('⏳ Starting S3 upload with 10-minute timeout...')
        const uploadResponse = (await Promise.race([
          uploadPromise,
          timeoutPromise,
        ])) as Response

        console.log('📊 S3 Upload status:', uploadResponse.status)

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error('❌ S3 Upload failed:', errorText)
          throw new Error(`S3 upload failed: ${uploadResponse.status}`)
        }

        console.log('✅ S3 Upload successful!')
        console.log('🔗 CDN URL:', result.presignedPost.cdnUrl)
        return result.presignedPost.cdnUrl
      } catch (error: any) {
        console.warn(
          '⚠️ Presigned POST failed, falling back to direct upload:',
          error.message
        )

        // Fallback: Use direct upload through server
        console.log('🔄 Falling back to direct server upload...')

        const fallbackFormData = new FormData()
        fallbackFormData.append('videoFile', file)
        fallbackFormData.append('folder', nameDir)
        fallbackFormData.append('usePresignedPost', 'false')

        console.log(
          '🔄 Fallback upload started - this may take 10-15 minutes for large files...'
        )
        const fallbackResponse = await fetch('/api/upload/video', {
          method: 'POST',
          body: fallbackFormData,
        })

        if (!fallbackResponse.ok) {
          throw new Error(`Fallback upload failed: ${fallbackResponse.status}`)
        }

        const fallbackResult = await fallbackResponse.json()
        console.log('✅ Fallback upload successful!')
        return fallbackResult.videoUrl
      }
    }

    // Fallback to direct upload response
    console.log('📋 Using fallback direct upload response')
    return result.videoUrl
  } catch (error) {
    console.error('❌ Error uploading video:', error)
    throw new Error('Failed to upload video')
  }
}

/**
 * Upload any file type to S3
 * @param file - The file to upload
 * @param nameDir - Directory name for organization
 * @param fileType - Type of file (image, video, document, etc.)
 * @returns Promise<string> - The public URL of the uploaded file
 */
export const getUploadedFileGeneric = async (
  file: File,
  nameDir: string = 'files'
): Promise<string> => {
  try {
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    const { uploadToS3 } = await import('@/lib/s3')

    const result = await uploadToS3(file, fileName, {
      folder: nameDir,
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        folder: nameDir,
        fileCategory: 'generic',
      },
    })

    return result.cdnUrl || result.url
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload file')
  }
}
