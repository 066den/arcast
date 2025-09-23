import { useState, useEffect } from 'react'

export interface Package {
  id: string
  name: string
  pricePerHour: string
  currency: string
  description: string
  deliveryTime: number
  features: string[]
  popular: boolean
  studioIds: string[]
}

interface UsePackagesReturn {
  packages: Package[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePackages(): UsePackagesReturn {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/packages')
      if (!response.ok) {
        throw new Error(
          `Failed to fetch packages: ${response.status} ${response.statusText}`
        )
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (contentType && !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Received non-JSON response:', text.substring(0, 200))
        throw new Error(
          'Server returned HTML instead of JSON. This usually indicates a server error.'
        )
      }

      const data = await response.json()
      if (data.success) {
        setPackages(data.packages)
      } else {
        throw new Error(data.error || 'Failed to fetch packages')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching packages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  return {
    packages,
    loading,
    error,
    refetch: fetchPackages,
  }
}
