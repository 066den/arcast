import { Preloader } from '@/components/ui/preloader'

export default function Loading() {
  return (
    <div className="p-4 flex-1 flex items-center justify-center">
      <Preloader variant="wave" size="lg" text="Loading studios..." />
    </div>
  )
}
