import { ApiError, apiRequest } from '@/lib/api'
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/lib/constants'
import { Studio } from '@/types'
import { toast } from 'sonner'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StudioStore {
  // State
  studios: Studio[]
  isLoading: boolean
  error: string | null

  // Actions
  setStudios: (studios: Studio[]) => void

  // Async actions
  fetchStudios: () => Promise<void>
  addStudio: (studio: Studio) => Promise<void>
  updateStudio: (id: string, update: Partial<Studio>) => Promise<void>
  updateStudioImage: (id: string, imageUrl: string) => Promise<void>
  deleteStudio: (studioId: string) => Promise<void>
}

const useStudioStore = create<StudioStore>()(
  persist(
    (set, get) => ({
      studios: [],
      isLoading: true,
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

      addStudio: async (studio: Studio) => {
        //==
      },

      updateStudio: async (id: string, update: Partial<Studio>) => {
        const { studios } = get()
        if (!studios) {
          toast.error(ERROR_MESSAGES.STUDIO.NOT_FOUND)
          return
        }

        const updatedStudios = studios.map(studio =>
          studio.id === id ? { ...studio, ...update } : studio
        )

        set({ studios: updatedStudios })

        try {
          await apiRequest<Studio>(API_ENDPOINTS.STUDIOS, {
            method: 'PUT',
            body: JSON.stringify({ id, update }),
          })
        } catch (error) {
          set({ studios })
          if (error instanceof ApiError) {
            toast.error(error.message)
          } else {
            toast.error(ERROR_MESSAGES.STUDIO.FAILED_TO_UPDATE_STUDIO)
          }
        }
      },

      updateStudioImage: async (id: string, imageUrl: string) => {
        //==
      },

      deleteStudio: async (studioId: string) => {
        //==
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
