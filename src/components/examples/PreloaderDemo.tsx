'use client'

import { useState } from 'react'
import {
  Preloader,
  PagePreloader,
  InlinePreloader,
} from '@/components/ui/preloader'
import { usePreloader, useAsyncPreloader } from '@/hooks/usePreloader'
import { Button } from '@/components/ui/button'

export function PreloaderDemo() {
  const [showPagePreloader, setShowPagePreloader] = useState(false)
  const [showInlinePreloader, setShowInlinePreloader] = useState(false)

  const preloader = usePreloader()
  const asyncPreloader = useAsyncPreloader()

  const simulateAsyncOperation = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return 'Operation completed!'
  }

  const handleAsyncOperation = async () => {
    try {
      await asyncPreloader.execute(simulateAsyncOperation, {
        text: 'Processing data...',
        variant: 'wave',
      })
    } catch (error) {
      console.error('Operation failed:', error)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-foreground">
        Preloader Components Demo
      </h1>

      {/* Basic Preloader Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Basic Preloader Variants
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
            <Preloader variant="spinner" size="md" />
            <span className="text-sm text-muted-foreground">Spinner</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
            <Preloader variant="dots" size="md" />
            <span className="text-sm text-muted-foreground">Dots</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
            <Preloader variant="pulse" size="md" />
            <span className="text-sm text-muted-foreground">Pulse</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
            <Preloader variant="wave" size="md" />
            <span className="text-sm text-muted-foreground">Wave</span>
          </div>
        </div>
      </section>

      {/* Different Sizes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Different Sizes
        </h2>
        <div className="flex items-center space-x-8">
          <div className="flex flex-col items-center space-y-2">
            <Preloader variant="spinner" size="sm" text="Small" />
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Preloader variant="spinner" size="md" text="Medium" />
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Preloader variant="spinner" size="lg" text="Large" />
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Preloader variant="spinner" size="xl" text="Extra Large" />
          </div>
        </div>
      </section>

      {/* Interactive Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Interactive Examples
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() =>
              preloader.show({ text: 'Loading...', variant: 'spinner' })
            }
            variant="outline"
          >
            Show Spinner
          </Button>
          <Button
            onClick={() =>
              preloader.show({ text: 'Processing...', variant: 'dots' })
            }
            variant="outline"
          >
            Show Dots
          </Button>
          <Button
            onClick={() =>
              preloader.show({ text: 'Syncing...', variant: 'wave' })
            }
            variant="outline"
          >
            Show Wave
          </Button>
          <Button onClick={preloader.hide} variant="outline">
            Hide Preloader
          </Button>
        </div>

        {preloader.isLoading && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <Preloader
              variant={preloader.variant}
              size="md"
              text={preloader.text}
            />
          </div>
        )}
      </section>

      {/* Async Operation Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Async Operation Example
        </h2>
        <Button
          onClick={handleAsyncOperation}
          disabled={asyncPreloader.isLoading}
          variant="default"
        >
          {asyncPreloader.isLoading ? 'Processing...' : 'Start Async Operation'}
        </Button>

        {asyncPreloader.isLoading && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <Preloader
              variant={asyncPreloader.variant}
              size="lg"
              text={asyncPreloader.text}
            />
          </div>
        )}
      </section>

      {/* Page Preloader Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Page Preloader
        </h2>
        <Button
          onClick={() => setShowPagePreloader(true)}
          variant="destructive"
        >
          Show Page Preloader
        </Button>

        {showPagePreloader && (
          <PagePreloader
            text="Loading page content..."
            variant="spinner"
            size="lg"
          />
        )}
      </section>

      {/* Inline Preloader Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Inline Preloader with Smooth Animations
        </h2>
        <Button
          onClick={() => setShowInlinePreloader(!showInlinePreloader)}
          variant="secondary"
        >
          Toggle Inline Preloader
        </Button>

        <InlinePreloader
          text="Loading content..."
          variant="dots"
          size="md"
          show={showInlinePreloader}
        />
      </section>
    </div>
  )
}
