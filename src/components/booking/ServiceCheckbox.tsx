'use client'

import { AdditionalService } from '../../types'

interface ServiceCheckboxProps {
  service: AdditionalService
  onChange: (services: Array<{ id: string; quantity: number }>) => void
  selectedServices: Array<{ id: string; quantity: number }>
}

export function ServiceCheckbox({
  service,
  onChange,
  selectedServices,
}: ServiceCheckboxProps) {
  const isChecked = selectedServices.some(({ id }) => id === service.id)

  const handleClick = () => {
    if (isChecked) {
      onChange(selectedServices.filter(({ id }) => id !== service.id))
    } else {
      onChange([...selectedServices, { id: service.id, quantity: 1 }])
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`flex gap-3 p-6 rounded-[1.25rem] shadow-xl/20 hover:shadow-xl/30 transition-all duration-300 cursor-pointer min-h-[165px] max-w-[540px] w-full ${
        isChecked ? 'shadow-xl/30' : ''
      }`}
    >
      <div className="flex-1 flex flex-col justify-between space-y-4">
        <h4 className="lg:text-3xl text-2xl">{service.name || 'Service'}</h4>
        {service.description && (
          <p className="font-nunito-sans">{service.description}</p>
        )}
      </div>
      <div className="flex flex-col items-end justify-between">
        <div className="md:size-12 size-8 flex items-center justify-center bg-input rounded-full border-3 border-primary">
          {isChecked && (
            <div className="md:size-8 size-6 bg-accent rounded-full" />
          )}
        </div>
        <h4 className="text-2xl font-medium">
          {typeof service.price === 'number'
            ? service.price
            : parseFloat(service.price.toString())}{' '}
          {service.currency || 'AED'}
        </h4>
      </div>
    </div>
  )
}
