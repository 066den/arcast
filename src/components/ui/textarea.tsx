import * as React from 'react'

import { cn } from '@/lib/utils'

interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  error?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'min-h-[80px] px-3 py-2 text-sm rounded-md',
  md: 'min-h-[120px] px-4 py-3 text-xl md:text-2xl rounded-2xl',
  lg: 'min-h-[160px] px-5 py-4 text-2xl md:text-3xl rounded-2xl',
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, size = 'sm', ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          data-slot="textarea"
          aria-invalid={error ? 'true' : 'false'}
          className={cn(
            'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-input flex w-full min-w-0 transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 resize-none',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:ring-inset',
            'aria-invalid:ring-destructive/40 aria-invalid:border-destructive aria-invalid:ring-inset',
            'not-placeholder-shown:bg-white not-placeholder-shown:ring-2 not-placeholder-shown:ring-input not-placeholder-shown:ring-inset',
            error && 'border-red-500 ring-red-500/20',
            sizeClasses[size],
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-red-500 absolute top-full left-4 mt-0.5">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
