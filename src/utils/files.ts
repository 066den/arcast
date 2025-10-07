import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { mkdir, writeFile, unlink } from 'fs/promises'

export const getUploadedFile = async (
  file: File,
  nameDir: string = 'images'
) => {
  const fileExtension = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExtension}`

  const uploadDir = join(process.cwd(), 'public', 'uploads', nameDir)
  const filePath = join(uploadDir, fileName)

  try {
    await mkdir(uploadDir, { recursive: true })
  } catch {
    // Error creating directory
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  await writeFile(filePath, buffer)

  return `/uploads/${nameDir}/${fileName}`
}

export const deleteUploadedFile = async (fileUrl: string) => {
  try {
    const filePath = join(process.cwd(), 'public', fileUrl)
    await unlink(filePath)
    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}
