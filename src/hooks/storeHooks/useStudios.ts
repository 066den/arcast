import { useEffect } from 'react'
import useBookingStore from '../../store/useBookingStore'
import useStudioStore from '../../store/useStudioStore'

export function useStudios() {
  const {
    isLoading,
    packages,
    setPackages,
    selectedIndices,
    clearBooking,
    selectStudio,
    selectPackage,
  } = useBookingStore()
  const {
    studios,
    setStudios,
    fetchStudios,
    createStudio,
    updateStudioImage,
    updateStudio,
  } = useStudioStore()

  useEffect(() => {
    if (!studios.length || !packages.length) return
    const { studio, package: selectedPackage } = selectedIndices
    if (!studio) {
      selectStudio(studios[0].id)
    }
    if (!selectedPackage) {
      selectPackage(packages[0].id)
    }
  }, [
    studios,
    packages,
    selectedIndices,
    selectStudio,
    selectPackage,
    fetchStudios,
  ])

  return {
    studios,
    isLoading,
    setStudios,
    packages,
    setPackages,
    fetchStudios,
    selectedStudioId: selectedIndices.studio,
    selectedPackageId: selectedIndices.package,
    clearBooking,
    onSelectStudio: selectStudio,
    onSelectPackage: selectPackage,
    createStudio,
    updateStudioImage,
    updateStudio,
  }
}
