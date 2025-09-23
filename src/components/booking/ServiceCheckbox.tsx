'use client'

import { Check } from 'lucide-react'
import { AdditionalService } from '../../types'
import { useState } from 'react'
import { DurationSelector } from '../ui/DurationSelector'

interface ServiceCheckboxProps {
  service: AdditionalService
  onChange: (services: AdditionalService[]) => void
  selectedServices: AdditionalService[]
}

export function ServiceCheckbox({
  service,
  onChange,
  selectedServices,
}: ServiceCheckboxProps) {
  const [duration, setDuration] = useState(3)
  const isChecked = selectedServices.some(({ id }) => id === service.id)
  const step = service.type === 'BY_THREE' ? 3 : 1

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onChange([...selectedServices, { ...service, quantity: duration / step }])
    } else {
      onChange(selectedServices.filter(({ id }) => id !== service.id))
    }
  }

  const handleDurationChange = (value: number) => {
    setDuration(value)
    const updatedServices = selectedServices.map(service =>
      service.id === service.id
        ? { ...service, quantity: value / step }
        : service
    )
    onChange(updatedServices)
  }

  return (
    <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
      <div className="relative">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
            isChecked ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
          }`}
        >
          {isChecked && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-slate-900">{service.name}</h4>
          <span className="text-sm font-medium text-blue-600">
            {service.price} {service.currency}
          </span>
        </div>

        <p className="text-sm text-slate-600 mb-2">{service.description}</p>
        {service.type === 'STANDARD' && (
          <DurationSelector
            value={duration}
            onChange={handleDurationChange}
            min={step}
            max={30}
            step={step}
          />
        )}
      </div>
    </label>
  )
}
