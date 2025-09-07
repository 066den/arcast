import {
  ALLOWED_FILE_TYPES,
  ERROR_MESSAGES,
  MAX_FILE_SIZE,
} from '@/lib/constants'

export const validateFile = (file: File): string | null => {
  if (
    !ALLOWED_FILE_TYPES.IMAGES.includes(
      file.type as (typeof ALLOWED_FILE_TYPES.IMAGES)[number]
    )
  ) {
    return ERROR_MESSAGES.FILE.TYPE_NOT_ALLOWED
  }

  if (file.size > MAX_FILE_SIZE.IMAGE) {
    return ERROR_MESSAGES.FILE.SIZE_EXCEEDED
  }

  return null
}
