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
    <div className="flex items-center gap-3 space-x-2">
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={handleDecrement}
        disabled={value <= min}
        className="size-15 border-none shadow-lg/20 hover:bg-white"
      >
        <Minus className="size-7 text-accent" />
      </Button>

      <div className="flex items-center justify-center min-w-[112px] h-15 px-3 bg-muted rounded-lg inset-shadow-sm">
        <span className="text-3xl font-medium font-hanken-grotesk">
          {value}
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={value >= max}
        className="size-15 border-none shadow-lg/20 hover:bg-white"
      >
        <Plus className="size-7 text-accent" />
      </Button>
    </div>
  )
}
