import { useEffect } from 'react'
import useBookingStore from '../../store/useBookingStore'

export function useStudios() {
  const {
    studios,
    isLoading,
    setStudios,
    packages,
    setPackages,
    selectedIndices,
    clearBooking,
    selectStudio,
    selectPackage,
  } = useBookingStore()

  useEffect(() => {
    if (!studios.length) return
    const { studio, package: selectedPackage } = selectedIndices
    if (!studio) {
      selectStudio(studios[0].id)
    }
    if (!selectedPackage) {
      selectPackage(packages[0].id)
    }
  }, [studios, packages, selectedIndices, selectStudio, selectPackage])

  return {
    studios,
    isLoading,
    setStudios,
    packages,
    setPackages,
    selectedStudioId: selectedIndices.studio,
    selectedPackageId: selectedIndices.package,
    clearBooking,
    onSelectStudio: selectStudio,
    onSelectPackage: selectPackage,
  }
}
