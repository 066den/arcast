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
  }
}
