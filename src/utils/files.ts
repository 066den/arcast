import { v4 as uuidv4 } from 'uuid'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'

/**
 * Upload a file to local uploads directory
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

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', nameDir)
    await mkdir(uploadsDir, { recursive: true })

    // Write file to disk
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    // Return the public URL
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
    // Extract file path from URL
    const urlPath = fileUrl.replace(/^\/uploads\//, '')
    const filePath = join(process.cwd(), 'public', 'uploads', urlPath)

    await unlink(filePath)
    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

/**
 * Upload a video file to S3
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

    const response = await fetch('/api/upload/video', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to upload video')
    }

    const result = await response.json()
    return result.videoUrl
  } catch (error) {
    console.error('Error uploading video:', error)
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

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', nameDir)
    await mkdir(uploadsDir, { recursive: true })

    // Write file to disk
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    // Return the public URL
    return `/uploads/${nameDir}/${fileName}`
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload file')
  }
}
