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

// Blog API functions
export interface CreateArticleData {
  title: string
  tagline: string
  mainText: string
  mainImageUrl: string
}

export async function createArticle(data: CreateArticleData) {
  return apiRequest('/api/blog', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function getArticles() {
  return apiRequest('/api/blog')
}

// Case Studies API functions
export interface CaseStudyData {
  title: string
  tagline: string
  mainText: string
  clientId?: string | null
  staffIds: string[]
  equipmentIds: string[]
  imageUrls: string[]
  caseContent: Array<{
    title: string
    text: string[]
    list: string[]
    imageUrl: string
    order: number
  }>
}

export async function createCaseStudy(data: CaseStudyData) {
  return apiRequest('/api/case-studies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function getCaseStudies() {
  return apiRequest('/api/case-studies')
}

export async function getCaseStudy(id: string) {
  return apiRequest(`/api/case-studies/${id}`)
}

export async function updateCaseStudy(
  id: string,
  data: Partial<CaseStudyData> & { isActive?: boolean }
) {
  return apiRequest(`/api/case-studies/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function deleteCaseStudy(id: string) {
  return apiRequest(`/api/case-studies/${id}`, {
    method: 'DELETE',
  })
}

export async function uploadCaseStudyImage(id: string, file: File) {
  const formData = new FormData()
  formData.append('imageFile', file)

  return apiRequest(`/api/case-studies/${id}/image`, {
    method: 'POST',
    body: formData,
  })
}

export async function deleteCaseStudyImage(id: string, imageUrl: string) {
  return apiRequest(
    `/api/case-studies/${id}/image?imageUrl=${encodeURIComponent(imageUrl)}`,
    {
      method: 'DELETE',
    }
  )
}

// Samples API functions
export interface SampleData {
  name: string
  thumbUrl?: string | null
  videoUrl?: string | null
  serviceTypeId?: string | null
}

export async function createSample(data: SampleData) {
  return apiRequest('/api/samples', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function getSamples() {
  return apiRequest('/api/samples')
}

export async function getSample(id: string) {
  return apiRequest(`/api/samples/${id}`)
}

export async function updateSample(id: string, data: Partial<SampleData>) {
  return apiRequest(`/api/samples/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function deleteSample(id: string) {
  return apiRequest(`/api/samples/${id}`, {
    method: 'DELETE',
  })
}

export async function uploadSampleImage(id: string, file: File) {
  const formData = new FormData()
  formData.append('imageFile', file)

  return apiRequest(`/api/samples/${id}/image`, {
    method: 'POST',
    body: formData,
  })
}

export async function deleteSampleImage(id: string) {
  return apiRequest(`/api/samples/${id}/image`, {
    method: 'DELETE',
  })
}

// Bookings API functions
export interface BookingUpdateData {
  status: string
}

export async function getBookings() {
  return apiRequest('/api/bookings')
}

export async function getBooking(id: string) {
  return apiRequest(`/api/bookings/${id}`)
}

export async function updateBookingStatus(id: string, status: string) {
  return apiRequest(`/api/bookings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
}

// Orders API
export async function getOrders(query?: Record<string, string | number>) {
  const params = query
    ? '?' +
      new URLSearchParams(
        Object.entries(query).map(([k, v]) => [k, String(v)])
      ).toString()
    : ''
  return apiRequest(`/api/orders${params}`)
}

export async function updateOrderStatus(id: string, status: string) {
  // Placeholder if/when endpoint is added
  return Promise.resolve({ id, status }) as unknown as Promise<{
    id: string
    status: string
  }>
}

// Clients API
export async function getClients() {
  return apiRequest('/api/clients')
}

export async function updateClient(
  id: string,
  data: Partial<{
    featured: boolean
    name: string
    jobTitle: string
    showTitle: string
    testimonial: string
    imageUrl: string
  }>
) {
  return apiRequest(`/api/clients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function createClient(data: {
  name?: string | null
  jobTitle?: string | null
  showTitle?: string | null
  testimonial?: string | null
  featured?: boolean
  imageUrl?: string | null
}) {
  return apiRequest('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function deleteClient(id: string) {
  return apiRequest(`/api/clients/${id}`, { method: 'DELETE' })
}

export async function uploadClientImage(id: string, file: File) {
  const formData = new FormData()
  formData.append('imageFile', file)
  return apiRequest(`/api/clients/${id}/image`, {
    method: 'POST',
    body: formData,
  })
}

export async function deleteClientImage(id: string) {
  return apiRequest(`/api/clients/${id}/image`, { method: 'DELETE' })
}

// Discount Codes API
export async function getDiscountCodes() {
  return apiRequest('/api/discount-codes')
}

export async function createDiscountCode(data: Record<string, unknown>) {
  return apiRequest('/api/discount-codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function updateDiscountCode(
  id: string,
  data: Record<string, unknown>
) {
  return apiRequest(`/api/discount-codes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function deleteDiscountCode(id: string) {
  return apiRequest(`/api/discount-codes/${id}`, { method: 'DELETE' })
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

    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type')
    if (contentType && !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Received non-JSON response:', text.substring(0, 200))
      throw new ApiError(
        'Server returned HTML instead of JSON. This usually indicates a server error.',
        response.status,
        'INVALID_RESPONSE_TYPE'
      )
    }

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
    // Handle JSON parsing errors specifically
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      throw new ApiError(
        'Invalid JSON response from server. This usually indicates a server error.',
        0,
        'INVALID_JSON'
      )
    }
    throw new ApiError('Network error', 0, 'NETWORK_ERROR')
  }
}
