import useStudioStore from '../../store/useStudioStore'

export function useStudios() {
  const {
    studios,
    isLoading,
    setStudios,
    fetchStudios,
    createStudio,
    updateStudioImage,
    updateStudio,
    updateStudioGallery,
    deleteStudioGallery,
    deleteStudio,
  } = useStudioStore()

  return {
    studios,
    isLoading,
    setStudios,
    fetchStudios,
    createStudio,
    updateStudioImage,
    updateStudio,
    updateStudioGallery,
    deleteStudioGallery,
    deleteStudio,
  }
}
