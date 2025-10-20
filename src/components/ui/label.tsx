'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const labelVariants = cva(
  'flex items-center gap-2 leading-none font-nunito-sans select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'text-sm', // Small labels for checkboxes, small forms
        default: 'text-base', // Standard size for form labels
        lg: 'text-lg', // Large labels for important sections
        xl: 'text-xl', // Extra large labels
        '2xl': 'text-2xl', // Very large labels
        '3xl': 'lg:text-3xl text-2xl', // Default responsive size
      },
    },
    defaultVariants: {
      size: '3xl',
    },
  }
)

export interface LabelProps
  extends React.ComponentProps<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {}

function Label({ className, size, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(labelVariants({ size }), className)}
      {...props}
    />
  )
}

export { Label }
