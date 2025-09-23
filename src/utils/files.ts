import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { mkdir, writeFile } from 'fs/promises'

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
  } catch (error) {
    // Error creating directory
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  await writeFile(filePath, buffer)

  return `/uploads/${nameDir}/${fileName}`
}
