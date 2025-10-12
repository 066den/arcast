'use client'

import { useState } from 'react'
import { Button } from './button'
import { Clock } from 'lucide-react'

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  availableTimes?: string[]
  disabled?: boolean
}

// Generate 30-minute intervals for 24 hours
const generateTimeSlots = (): string[] => {
  const times: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      times.push(timeString)
    }
  }
  return times
}

export function TimePicker({
  value,
  onChange,
  availableTimes = generateTimeSlots(),
  disabled = false,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTimeSelect = (time: string) => {
    onChange(time)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between"
        type="button"
      >
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {value || 'Select time'}
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white bg-slate-800 border border-slate-200 border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {availableTimes?.map(time => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className={`w-full px-4 py-2 text-left hover:bg-slate-100 hover:bg-slate-700 transition-colors ${
                value === time
                  ? 'bg-blue-100 bg-blue-900 text-blue-900 text-blue-100'
                  : 'text-slate-900 text-slate-100'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
