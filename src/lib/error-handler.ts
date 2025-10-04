import { ApiError } from './api'

export interface ErrorResponse {
  success: false
  error: string
  code?: string
  message?: string
  details?: string
  timestamp?: string
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 404:
        return 'Resource not found. Please try again.'
      case 403:
        return 'Access denied. Please check your permissions.'
      case 401:
        return 'Authentication required. Please log in.'
      case 400:
        return error.message || 'Invalid request. Please check your input.'
      case 429:
        return 'Too many requests. Please try again later.'
      case 500:
        return 'Server error. Please try again later.'
      case 502:
        return 'Service temporarily unavailable. Please try again later.'
      case 503:
        return 'Service temporarily unavailable. Please try again later.'
      default:
        return error.message || 'An unexpected error occurred.'
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.'
    }

    if (error.message.includes('timeout')) {
      return 'Request timeout. Please try again.'
    }

    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}

export function parseErrorResponse(response: unknown): ErrorResponse | null {
  if (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    response.success === false
  ) {
    const errorResponse = response as Record<string, unknown>
    return {
      success: false,
      error: (errorResponse.error as string) || 'Unknown error',
      code: errorResponse.code as string,
      message: errorResponse.message as string,
      details: errorResponse.details as string,
      timestamp: errorResponse.timestamp as string,
    }
  }
  return null
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred'
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout')
    )
  }
  return false
}

export function isServerError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode >= 500
  }
  return false
}

export function isClientError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode >= 400 && error.statusCode < 500
  }
  return false
}
