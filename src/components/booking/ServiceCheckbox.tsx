'use client'

import { Check } from 'lucide-react'
import { AdditionalService } from '../../types'
import { useState } from 'react'
import { DurationSelector } from '../ui/DurationSelector'
import { cn } from '@/lib/utils'

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
    <label
      className={cn(
        'flex gap-3 p-6 rounded-[1.25rem] shadow-xl/20 hover:shadow-xl/30 transition-all duration-300 cursor-pointer min-h-[165px] max-w-[540px]',
        isChecked && 'shadow-xl/30'
      )}
    >
      <div className="flex-1 flex flex-col justify-between space-y-4">
        <h4 className="text-3xl">{service.name}</h4>

        <p className="font-nunito-sans">{service.description}</p>
        {/* {service.type === 'STANDARD' && (
          <DurationSelector
            value={duration}
            onChange={handleDurationChange}
            min={step}
            max={30}
            step={step}
          />
        )} */}
      </div>
      <div className="flex flex-col items-end justify-between">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          className="sr-only"
        />
        <div className="md:size-12 size-8 flex items-center justify-center bg-input rounded-full border-3 border-primary">
          {isChecked && (
            <div className="md:size-8 size-6 bg-accent rounded-full" />
          )}
        </div>
        <h4 className="text-2xl font-medium">
          {Number(service.price)} {service.currency}
        </h4>
      </div>
    </label>
  )
}
