import * as React from 'react'

import { cn } from '@/lib/utils'

interface InputProps extends React.ComponentProps<'input'> {
  error?: string
}

function Input({ className, type, error, ...props }: InputProps) {
  return (
    <div className="relative w-full">
      <input
        type={type}
        data-slot="input"
        aria-invalid={error ? 'true' : 'false'}
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-input flex h-18 w-full min-w-0 rounded-2xl px-4 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-2xl',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          'not-placeholder-shown:bg-white not-placeholder-shown:ring-2 not-placeholder-shown:ring-input',
          error && 'border-red-500 ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-red-500 absolute top-full left-4 mt-1">{error}</p>
      )}
    </div>
  )
}

export { Input }
