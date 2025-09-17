export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()
    if (!response.ok) {
      throw new ApiError(
        data.error || 'Request failed',
        response.status,
        data.code
      )
    }
    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('Network error', 0, 'NETWORK_ERROR')
  }
}
