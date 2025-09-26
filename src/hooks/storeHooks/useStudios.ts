import useStudioStore from '../../store/useStudioStore'

export function useStudios() {
  const {
    studios,
    setStudios,
    fetchStudios,
    createStudio,
    updateStudioImage,
    updateStudio,
  } = useStudioStore()

  return {
    studios,
    setStudios,
    fetchStudios,
    createStudio,
    updateStudioImage,
    updateStudio,
  }
}
