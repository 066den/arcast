'use client'
import { ErrorSkeleton } from '@/components/ui/skeletons'

export default function StudiosError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorSkeleton
        title="Error loading studios"
        description={
          error.message || 'Failed to load studios. Please try again later.'
        }
        onRetry={reset}
      />
    </div>
  )
}
