'use client'

import { ComponentProps, useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { getCountries, getCountryCallingCode } from 'libphonenumber-js'

interface InputPhoneProps extends Omit<ComponentProps<'input'>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  error?: string
  onChangeValue: (value: string) => void
}

const InputPhone = ({ onChangeValue, error, size = 'sm' }: InputPhoneProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [countryCode, setCountryCode] = useState('+971')
  const [customValue, setCustomValue] = useState('')

  const countryes = getCountries().map(code => ({
    code: `+${getCountryCallingCode(code)}`,
    country: code,
  }))

  const handleCountryCodeSelect = (countryCode: string) => {
    setCountryCode(countryCode)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const rawValue = value.replace(/\D/g, '')
    setCustomValue(rawValue)
    onChangeValue(countryCode + rawValue)
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center md:gap-4 gap-2">
        <div className="relative">
          <Button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full justify-between bg-input md:h-18 h-16 md:text-2xl text-xl rounded-2xl hover:bg-input shadow-none hover:shadow-none text-primary md:min-w-[105px]"
            disabled={!countryes}
          >
            <span className="flex items-center gap-2">
              {countryCode || 'Select country code'}
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
            <div className="absolute z-50 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {countryes?.map(({ code, country }) => (
                <button
                  key={country}
                  onClick={() => handleCountryCodeSelect(code)}
                  className={`w-full p-2 text-left whitespace-nowrap transition-colors ${
                    code === countryCode
                      ? 'bg-primary text-white'
                      : 'text-primary'
                  }`}
                >
                  {code} {country}
                </button>
              ))}
            </div>
          )}
        </div>
        <Input
          type="tel"
          autoComplete="tel"
          value={customValue}
          onChange={handleInputChange}
          placeholder="Phone number"
          size={size}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default InputPhone
