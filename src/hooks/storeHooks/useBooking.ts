import useBookingStore from '@/store/useBookingStore'

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
  }
}
