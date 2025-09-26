import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BookingStore {
  // State
  selectedIndices: {
    studio: string
    service: string
    package: string
  }
  isLoading: boolean

  // Actions
  selectStudio: (studioId: string) => void
  selectService: (serviceId: string) => void
  selectPackage: (packageId: string) => void
  // Async actions
  createBooking: () => Promise<void>

  // Computed
  clearBooking: () => void
  totalPrice: () => number
}

const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      selectedIndices: {
        studio: '',
        service: '',
        package: '',
      },
      isLoading: false,
      selectStudio: (studioId: string) =>
        set({
          selectedIndices: { ...get().selectedIndices, studio: studioId },
        }),
      selectService: (serviceId: string) =>
        set({
          selectedIndices: {
            ...get().selectedIndices,
            service: serviceId,
            package: '',
          },
        }),
      selectPackage: (packageId: string) =>
        set({
          selectedIndices: {
            ...get().selectedIndices,
            package: packageId,
            service: '',
          },
        }),
      createBooking: async () => {
        // const booking = await createBooking()
        // set({ booking })
      },

      clearBooking: () => {
        set({
          selectedIndices: { studio: '', service: '', package: '' },
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
        selectedIndices: state.selectedIndices,
      }),
    }
  )
)

export default useBookingStore
