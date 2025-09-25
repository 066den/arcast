# Carousel with Peek Effect

This component provides a carousel slider with a "peek" effect that shows part of the next slide on the right side, creating a visual hint that there are more slides to explore.

## Features

- **Peek Effect**: Shows a portion of the next slide with a gradient overlay
- **Responsive Design**: Adapts to different screen sizes
- **Customizable**: Configurable peek amount and styling
- **Accessibility**: Full keyboard navigation support
- **Touch/Swipe Support**: Works with touch devices

## Usage

```tsx
import {
  CarouselWithPeek,
  CarouselContentWithPeek,
  CarouselItemWithPeek,
  CarouselNextWithPeek,
  CarouselPreviousWithPeek,
} from '@/components/ui/carousel-with-peek'

function MyCarousel() {
  return (
    <CarouselWithPeek
      opts={{
        align: 'start',
        loop: true,
        slidesToScroll: 1,
      }}
      className="w-full"
      peekAmount={120} // Amount of next slide to show (in pixels)
    >
      <CarouselContentWithPeek className="overflow-visible">
        {items.map(item => (
          <CarouselItemWithPeek
            key={item.id}
            className="basis-1/2 lg:basis-1/3 xl:basis-1/4"
          >
            <YourCardComponent item={item} />
          </CarouselItemWithPeek>
        ))}
      </CarouselContentWithPeek>
      <CarouselPreviousWithPeek />
      <CarouselNextWithPeek />
    </CarouselWithPeek>
  )
}
```

## Props

### CarouselWithPeek

- `peekAmount?: number` - Amount of next slide to show in pixels (default: 100)
- `opts?: CarouselOptions` - Embla carousel options
- `plugins?: CarouselPlugin` - Embla carousel plugins
- `orientation?: 'horizontal' | 'vertical'` - Carousel orientation
- `setApi?: (api: CarouselApi) => void` - Callback to get carousel API
- `onMouseEnter?: () => void` - Mouse enter handler
- `onMouseLeave?: () => void` - Mouse leave handler

### CarouselItemWithPeek

- `className?: string` - Additional CSS classes
- Responsive breakpoints: `basis-1/2 lg:basis-1/3 xl:basis-1/4`

## Styling

The component includes built-in gradient overlays that create the peek effect. You can customize the appearance by:

1. Adjusting the `peekAmount` prop
2. Modifying the gradient styles in the component
3. Adding custom CSS classes

## Implementation Details

The peek effect is achieved by:

1. Using `overflow: hidden` on the carousel container
2. Adding gradient overlays positioned absolutely on the right side
3. Using multiple gradient layers for depth and visual appeal
4. Responsive width adjustments for different screen sizes

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Touch devices with swipe gesture support
- Keyboard navigation (Arrow keys)
