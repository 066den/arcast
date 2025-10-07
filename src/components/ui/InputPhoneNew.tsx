'use client'

import { ComponentProps, useState } from 'react'
import { Input } from './input'
import { getCountries, getCountryCallingCode } from 'libphonenumber-js'
import { Select, SelectContent, SelectItem, SelectTrigger } from './select'

interface InputPhoneProps extends Omit<ComponentProps<'input'>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  error?: string
  onChangeValue: (value: string) => void
}

const InputPhoneNew = ({
  onChangeValue,
  error,
  size = 'md',
}: InputPhoneProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [countryCode, setCountryCode] = useState('+971')
  const [customValue, setCustomValue] = useState('')

  const countryes = getCountries()
    .map(code => ({
      code: `+${getCountryCallingCode(code)}`,
      country: code,
    }))
    .filter(
      (country, index, self) =>
        index === self.findIndex(c => c.code === country.code)
    )

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
      <div className="flex gap-0">
        <Select value={countryCode} onValueChange={setCountryCode}>
          <SelectTrigger
            size={size}
            className="font-mono w-auto rounded-r-none border-r-0"
          >
            {countryCode}
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {countryes.map(country => (
              <SelectItem key={country.code} value={country.code}>
                {country.code}{' '}
                <span className="text-muted-foreground">{country.country}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="tel"
          autoComplete="tel"
          value={customValue}
          onChange={handleInputChange}
          placeholder="Phone number"
          size={size}
          className="rounded-l-none border-l-2 flex-1"
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default InputPhoneNew
