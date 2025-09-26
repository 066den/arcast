# Preloader Components

Modern preloader components with animations for Next.js applications.

## Components

### Preloader

Basic preloader component with various animation variants.

```tsx
import { Preloader } from '@/components/ui/preloader'

// Basic usage
<Preloader />

// With text and variant
<Preloader
  variant="dots"
  size="lg"
  text="Loading..."
/>
```

### PagePreloader

Full-screen preloader for page loading.

```tsx
import { PagePreloader } from '@/components/ui/preloader'
;<PagePreloader text="Loading page..." variant="spinner" size="lg" />
```

### InlinePreloader

Inline preloader for content areas.

```tsx
import { InlinePreloader } from '@/components/ui/preloader'
;<InlinePreloader text="Loading content..." variant="wave" size="md" />
```

## Hooks

### usePreloader

Hook for managing preloader state.

```tsx
import { usePreloader } from '@/hooks/usePreloader'

function MyComponent() {
  const preloader = usePreloader()

  const handleLoad = () => {
    preloader.show({ text: 'Loading...', variant: 'dots' })
    // ... perform operation
    preloader.hide()
  }

  return (
    <div>
      <button onClick={handleLoad}>Load Data</button>
      {preloader.isLoading && (
        <Preloader variant={preloader.variant} text={preloader.text} />
      )}
    </div>
  )
}
```

### useAsyncPreloader

Hook for automatic loading state management during async operations.

```tsx
import { useAsyncPreloader } from '@/hooks/usePreloader'

function MyComponent() {
  const asyncPreloader = useAsyncPreloader()

  const handleAsyncOperation = async () => {
    try {
      const result = await asyncPreloader.execute(fetchDataFromAPI, {
        text: 'Fetching data...',
        variant: 'wave',
      })
      console.log(result)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div>
      <button
        onClick={handleAsyncOperation}
        disabled={asyncPreloader.isLoading}
      >
        {asyncPreloader.isLoading ? 'Loading...' : 'Fetch Data'}
      </button>
    </div>
  )
}
```

## Parameters

### variant

Type of preloader animation:

- `spinner` - rotating spinner (default)
- `dots` - animated dots
- `pulse` - pulsing circle
- `wave` - wave animation

### size

Preloader size:

- `sm` - small
- `md` - medium (default)
- `lg` - large
- `xl` - extra large

### text

Text displayed below the preloader (optional).

## Styling

Components use CSS variables from your theme and automatically adapt to light/dark themes.

## Animations

All animations use Framer Motion for smooth transitions. Animations are optimized for performance and accessibility.

## Usage Examples

See `src/components/examples/PreloaderDemo.tsx` file for complete usage examples of all components and hooks.
