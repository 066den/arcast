import useBookingStore from '@/store/useBookingStore'

export function useBooking() {
  const {
    isLoading,
    selectedIndices,
    clearBooking,
    selectStudio,
    selectService,
    selectPackage,
  } = useBookingStore()

  const { studio, service, package: packageId } = selectedIndices

  return {
    isLoading,
    selectStudioId: studio,
    selectServiceId: service,
    selectPackageId: packageId,
    clearBooking,
    selectStudio,
    selectService,
    selectPackage,
  }
}
