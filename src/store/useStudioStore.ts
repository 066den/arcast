import { ApiError, apiRequest } from '@/lib/api'
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/lib/constants'
import { Studio } from '@/types' // Removed StudioFormData import as it does not exist
import { StudioFormData } from '@/types/api'
import { toast } from 'sonner'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StudioStore {
  // State
  studios: Studio[] | null
  isLoading: boolean
  error: string | null

  // Actions
  setStudios: (studios: Studio[]) => void

  // Async actions
  fetchStudios: () => Promise<void>
  createStudio: (studio: StudioFormData) => Promise<void>
  updateStudio: (id: string, update: Partial<Studio>) => Promise<void>
  updateStudioImage: (studioId: string, imageFile: File) => Promise<void>
  updateStudioGallery: (studioId: string, imageFile: File) => Promise<void>
  deleteStudioGallery: (studioId: string, image: string) => Promise<void>
  deleteStudio: (studioId: string) => Promise<void>
}

const useStudioStore = create<StudioStore>()(
  persist(
    (set, get) => ({
      studios: null,
      isLoading: false,
      error: null,
      setStudios: (studios: Studio[]) => set({ studios }),

      fetchStudios: async () => {
        set({ isLoading: true })
        try {
          const studios = await apiRequest<Studio[]>(API_ENDPOINTS.STUDIOS)
          set({ studios, isLoading: false })
        } catch (error) {
          if (error instanceof ApiError) {
            toast.error(error.message)
          }
        } finally {
          set({ isLoading: false })
        }
      },

      createStudio: async (studio: StudioFormData) => {
        set({ isLoading: true })
        const {
          name,
          openingTime,
          closingTime,
          location,
          totalSeats,
          imageFile,
        } = studio
        const formData = new FormData()
        formData.append('name', name)
        formData.append('openingTime', openingTime)
        formData.append('closingTime', closingTime)
        if (location) formData.append('location', location)
        if (totalSeats) formData.append('totalSeats', totalSeats.toString())
        if (imageFile) formData.append('imageFile', imageFile)

        try {
          const newStudio = await apiRequest<Studio>(API_ENDPOINTS.STUDIOS, {
            method: 'POST',
            body: formData,
          })

          set({ studios: [...(get().studios || []), newStudio] })
        } catch (error) {
          if (error instanceof ApiError) {
            throw new Error(error.message)
          }
        } finally {
          set({ isLoading: false })
        }
      },

      updateStudio: async (id: string, update: Partial<Studio>) => {
        const { studios } = get()

        const updatedStudios = studios?.map(studio =>
          studio.id === id ? { ...studio, ...update } : studio
        )

        set({ studios: updatedStudios })

        try {
          await apiRequest<Studio>(`${API_ENDPOINTS.STUDIOS}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ updateData: update }),
          })
        } catch (error) {
          set({ studios })
          if (error instanceof ApiError) {
            throw new Error(error.message)
          } else {
            toast.error(ERROR_MESSAGES.STUDIO.FAILED_TO_UPDATE_STUDIO)
          }
        }
      },

      updateStudioImage: async (studioId: string, imageFile: File) => {
        const { studios } = get()

        const formData = new FormData()
        formData.append('imageFile', imageFile)

        try {
          const response = await apiRequest<Studio>(
            `${API_ENDPOINTS.STUDIOS}/${studioId}/image`,
            {
              method: 'POST',
              body: formData,
            }
          )

          const updatedStudios = studios?.map(studio =>
            studio.id === studioId
              ? { ...studio, imageUrl: response.imageUrl }
              : studio
          )

          set({ studios: updatedStudios })
        } catch (error) {
          if (error instanceof ApiError) {
            throw new Error(error.message)
          }
        }
      },

      updateStudioGallery: async (studioId: string, imageFile: File) => {
        const { studios } = get()

        const formData = new FormData()
        formData.append('imageFile', imageFile)

        try {
          const response = await apiRequest<Studio>(
            `${API_ENDPOINTS.STUDIOS}/${studioId}/gallery`,
            {
              method: 'POST',
              body: formData,
            }
          )

          const updatedStudios = studios?.map(studio =>
            studio.id === studioId
              ? { ...studio, gallery: response.gallery }
              : studio
          )

          set({ studios: updatedStudios })
        } catch (error) {
          if (error instanceof ApiError) {
            throw new Error(error.message)
          }
        }
      },

      deleteStudioGallery: async (studioId: string, image: string) => {
        const { studios } = get()

        try {
          const response = await apiRequest<Studio>(
            `${API_ENDPOINTS.STUDIOS}/${studioId}/gallery`,
            {
              method: 'DELETE',
              body: JSON.stringify({ imageUrl: image }),
            }
          )

          console.log(response)

          const updatedStudios = studios?.map(studio =>
            studio.id === studioId
              ? {
                  ...studio,
                  gallery: response.gallery,
                }
              : studio
          )

          set({ studios: updatedStudios })
        } catch (error) {
          if (error instanceof ApiError) {
            throw new Error(error.message)
          }
        }
      },

      deleteStudio: async (studioId: string) => {
        // TODO: Implement studio deletion
      },
    }),
    {
      name: 'studio-store',
      partialize: state => ({
        studios: state.studios,
      }),
    }
  )
)

export default useStudioStore
