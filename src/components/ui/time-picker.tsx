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

export function TimePicker({ 
  value, 
  onChange, 
  availableTimes = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ],
  disabled = false 
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
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {availableTimes.map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className={`w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                value === time
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                  : 'text-slate-900 dark:text-slate-100'
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
