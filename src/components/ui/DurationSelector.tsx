'use client'

import { Button } from '@/components/ui/button'
import { MAX_BOOKING_HOURS, MIN_BOOKING_DURATION } from '@/lib/constants'
import { Minus, Plus } from 'lucide-react'

interface DurationSelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export const DurationSelector = ({
  value,
  onChange,
  min = MIN_BOOKING_DURATION,
  max = MAX_BOOKING_HOURS,
  step = 1,
}: DurationSelectorProps) => {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + step)
    }
  }

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - step)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={value <= min}
        className="h-10 w-10 rounded-full"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <div className="flex items-center justify-center min-w-[60px] h-10 px-3 bg-muted rounded-md border">
        <span className="text-lg font-semibold">{value}</span>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={value >= max}
        className="h-10 w-10 rounded-full"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
