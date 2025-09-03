import { create } from 'zustand'
import { Studio, StudioPackage } from '../types'
import { persist } from 'zustand/middleware'

import { apiRequest, ApiError } from '@/lib/api'
import { toast } from 'sonner'

interface BookingStore {
  // State
  currentStep: number
  studios: Studio[]
  packages: StudioPackage[]
  selectedIndices: {
    studio: string
    package: string
  }
  isLoading: boolean

  // Actions
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  selectStudio: (studioId: string) => void
  selectPackage: (packageId: string) => void

  // Async actions
  createBooking: () => Promise<void>

  // Computed
  setStudios: (studios: Studio[]) => void
  setPackages: (packages: StudioPackage[]) => void
  clearBooking: () => void
  totalPrice: () => number
}

const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      studios: [],
      packages: [],
      selectedIndices: {
        studio: '',
        package: '',
      },
      isLoading: false,
      setStep: (step: number) => set({ currentStep: step }),
      nextStep: () => set(state => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set(state => ({ currentStep: state.currentStep - 1 })),
      selectStudio: (studioId: string) =>
        set({
          selectedIndices: { ...get().selectedIndices, studio: studioId },
        }),
      selectPackage: (packageId: string) =>
        set({
          selectedIndices: { ...get().selectedIndices, package: packageId },
        }),
      setStudios: (studios: Studio[]) => set({ studios }),
      setPackages: (packages: StudioPackage[]) => set({ packages }),
      createBooking: async () => {
        // const booking = await createBooking()
        // set({ booking })
      },

      clearBooking: () => {
        set({
          selectedIndices: { studio: '', package: '' },
          currentStep: 0,
        })
      },

      totalPrice: () => {
        // const package = get().selectedPackage()
        // const studio = get().selectedStudio()
        // if (!package || !studio) return 0
        // const price = parseFloat(package.price_per_hour)
        // const duration = (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60)
        return 0
      },
    }),
    {
      name: 'booking-store',
      partialize: state => ({
        studios: state.studios,
        currentStep: state.currentStep,
        selectedIndices: state.selectedIndices,
      }),
    }
  )
)

export default useBookingStore
