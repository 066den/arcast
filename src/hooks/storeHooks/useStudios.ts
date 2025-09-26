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
  } = useStudioStore()

  return {
    studios,
    isLoading,
    setStudios,
    fetchStudios,
    createStudio,
    updateStudioImage,
    updateStudio,
  }
}
