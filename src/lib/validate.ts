import { ALLOWED_FILE_TYPES, ERROR_MESSAGES, MAX_FILE_SIZE } from './constants'

export const validateFile = (file: File): string | null => {
  if (
    !ALLOWED_FILE_TYPES.IMAGES.includes(
      file.type as (typeof ALLOWED_FILE_TYPES.IMAGES)[number]
    )
  ) {
    return ERROR_MESSAGES.FILE.TYPE_NOT_ALLOWED
  }

  if (file.size > MAX_FILE_SIZE.IMAGE) {
    return ERROR_MESSAGES.FILE.IMAGE_SIZE_EXCEEDED
  }

  return null
}

export const validateVideoFile = (file: File): string | null => {
  if (
    !ALLOWED_FILE_TYPES.VIDEOS.includes(
      file.type as (typeof ALLOWED_FILE_TYPES.VIDEOS)[number]
    )
  ) {
    return ERROR_MESSAGES.FILE.TYPE_NOT_ALLOWED
  }

  if (file.size > MAX_FILE_SIZE.VIDEO) {
    return ERROR_MESSAGES.FILE.VIDEO_SIZE_EXCEEDED
  }

  return null
}

export const validateAudioFile = (file: File): string | null => {
  if (
    !ALLOWED_FILE_TYPES.AUDIO.includes(
      file.type as (typeof ALLOWED_FILE_TYPES.AUDIO)[number]
    )
  ) {
    return ERROR_MESSAGES.FILE.TYPE_NOT_ALLOWED
  }

  if (file.size > MAX_FILE_SIZE.AUDIO) {
    return ERROR_MESSAGES.FILE.AUDIO_SIZE_EXCEEDED
  }

  return null
}

export const validateDocumentFile = (file: File): string | null => {
  if (
    !ALLOWED_FILE_TYPES.DOCUMENTS.includes(
      file.type as (typeof ALLOWED_FILE_TYPES.DOCUMENTS)[number]
    )
  ) {
    return ERROR_MESSAGES.FILE.TYPE_NOT_ALLOWED
  }

  if (file.size > MAX_FILE_SIZE.DOCUMENT) {
    return ERROR_MESSAGES.FILE.DOCUMENT_SIZE_EXCEEDED
  }

  return null
}

export const validateFileByType = (
  file: File,
  fileType: 'image' | 'video' | 'audio' | 'document'
): string | null => {
  switch (fileType) {
    case 'image':
      return validateFile(file)
    case 'video':
      return validateVideoFile(file)
    case 'audio':
      return validateAudioFile(file)
    case 'document':
      return validateDocumentFile(file)
    default:
      return ERROR_MESSAGES.FILE.TYPE_NOT_ALLOWED
  }
}
