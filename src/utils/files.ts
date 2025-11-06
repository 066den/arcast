import { v4 as uuidv4 } from 'uuid'
import { unlink, mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * Save file to local uploads directory
 * @param file - The file to save
 * @param nameDir - Directory name for organization (e.g., 'images', 'videos', 'studios')
 * @returns Promise<string> - The public URL of the saved file
 */
export const saveFileLocally = async (
  file: File,
  nameDir: string = 'images'
): Promise<string> => {
  try {
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    // Create uploads directory structure
    const uploadsDir = join(process.cwd(), 'public', 'uploads', nameDir)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save file
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    // Return public URL
    const publicUrl = `/uploads/${nameDir}/${fileName}`
    return publicUrl
  } catch (error) {
    console.error('Local file save error:', error)
    throw error
  }
}

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

    const { uploadToS3 } = await import('@/lib/s3')

    const result = await uploadToS3(file, fileName, {
      folder: nameDir,
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        folder: nameDir,
        fileCategory: 'image',
      },
    })

    return result.cdnUrl || result.url
  } catch (error) {
    console.error('File upload error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to upload file: ${errorMessage}`)
  }
}

/**
 * Delete a file from local uploads directory or S3
 * @param fileUrl - The URL of the file to delete
 * @returns Promise<boolean> - Success status
 */
export const deleteUploadedFile = async (fileUrl: string): Promise<boolean> => {
  // Static assets in /assets/ are not deletable via API (they're part of the codebase)
  // Return true to indicate they don't need deletion
  if (fileUrl.startsWith('/assets/')) {
    console.log('Static asset path detected, skipping deletion:', fileUrl)
    return true
  }

  // Check if it's a local uploaded file (starts with /uploads/)
  const isLocalFile = fileUrl.startsWith('/uploads/')

  // If it's a local file, delete it directly without importing S3
  if (isLocalFile) {
    try {
      const urlPath = fileUrl.replace(/^\/uploads\//, '')
      const filePath = join(process.cwd(), 'public', 'uploads', urlPath)
      await unlink(filePath)
      return true
    } catch (error: any) {
      // Ignore ENOENT errors (file doesn't exist) - this is not critical
      if (error?.code === 'ENOENT') {
        const urlPath = fileUrl.replace(/^\/uploads\//, '')
        console.log('Local file not found (may already be deleted):', urlPath)
        return true // Treat as success since file doesn't exist
      }
      console.error('Error deleting local file:', error)
      return false
    }
  }

  // For non-local files, try to delete from S3 (only if S3 is configured)
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
    // If S3 is not configured or import fails, just log and continue
    // This is expected if we're using local storage only
    if (process.env.NODE_ENV === 'development') {
      console.log('S3 not available, skipping S3 deletion:', error)
    }
  }

  return false
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      } catch {
        // If response is not JSON, use status text or default message
        errorMessage = response.statusText || errorMessage
      }

      // Add status code to error message for better debugging
      throw new Error(`${response.status}: ${errorMessage}`)
    }

    const result = await response.json()

    // Handle presigned POST response
    if (result.presignedPost) {
      // Upload directly to S3 using presigned POST
      const uploadFormData = new FormData()

      // Add all presigned fields (MinIO and other providers may have different field names)
      Object.entries(result.presignedPost.fields).forEach(([key, value]) => {
        uploadFormData.append(key, value as string)
      })

      // Add the file last
      uploadFormData.append('file', file)

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

        const uploadResponse = (await Promise.race([
          uploadPromise,
          timeoutPromise,
        ])) as Response

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()

          throw new Error(`S3 upload failed: ${uploadResponse.status}`)
        }

        return result.presignedPost.cdnUrl
      } catch {
        // Fallback: Use direct upload through server

        const fallbackFormData = new FormData()
        fallbackFormData.append('videoFile', file)
        fallbackFormData.append('folder', nameDir)
        fallbackFormData.append('usePresignedPost', 'false')

        const fallbackResponse = await fetch('/api/upload/video', {
          method: 'POST',
          body: fallbackFormData,
        })

        if (!fallbackResponse.ok) {
          throw new Error(`Fallback upload failed: ${fallbackResponse.status}`)
        }

        const fallbackResult = await fallbackResponse.json()

        return fallbackResult.videoUrl
      }
    }

    // Fallback to direct upload response

    return result.videoUrl
  } catch {
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
  } catch {
    throw new Error('Failed to upload file')
  }
}
