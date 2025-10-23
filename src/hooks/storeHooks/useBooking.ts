import useBookingStore from '@/store/useBookingStore'
import { useMemo } from 'react'

export function useBooking() {
  const {
    isLoading,
    selectedIndices,
    clearBooking,
    selectStudio,
    selectService,
    selectPackage,
    selectServiceType,
  } = useBookingStore()

  const { studio, service, package: packageId, serviceType } = selectedIndices

  const isBooking = useMemo(() => {
    return serviceType === 'podcast' || serviceType === 'beneficial'
  }, [serviceType])

  return {
    isLoading,
    selectStudioId: studio,
    selectServiceId: service,
    selectPackageId: packageId,
    selectServiceTypeSlug: serviceType,
    clearBooking,
    selectStudio,
    selectService,
    selectPackage,
    selectServiceType,
    isBooking,
  }
}
