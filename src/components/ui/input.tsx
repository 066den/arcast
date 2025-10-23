import * as React from 'react'

import { cn } from '@/lib/utils'

interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  error?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-9 px-3 text-sm md:text-base rounded-md',
  md: 'h-16 md:h-18 px-4 text-xl md:text-2xl rounded-2xl',
  lg: 'h-20 md:h-22 px-5 text-2xl md:text-3xl rounded-2xl',
}

function Input({ className, type, error, size = 'sm', ...props }: InputProps) {
  return (
    <div className="relative w-full">
      <input
        type={type}
        data-slot="input"
        aria-invalid={error ? 'true' : 'false'}
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-input flex w-full min-w-0 py-1 transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:ring-ring/50 focus-visible:ring-[2px] focus-visible:ring-inset',
          'aria-invalid:ring-destructive/40 aria-invalid:border-destructive aria-invalid:ring-inset',
          'not-placeholder-shown:bg-white not-placeholder-shown:ring-2 not-placeholder-shown:ring-input not-placeholder-shown:ring-inset',
          error && 'border-red-500 ring-red-500/20',
          sizeClasses[size],
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm absolute top-full left-4 mt-0.5">
          {error}
        </p>
      )}
    </div>
  )
}

export { Input }
