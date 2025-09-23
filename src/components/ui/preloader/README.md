# Preloader Components

Современные компоненты прелоадера с анимациями для Next.js приложения.

## Компоненты

### Preloader

Базовый компонент прелоадера с различными вариантами анимации.

```tsx
import { Preloader } from '@/components/ui/preloader'

// Базовое использование
<Preloader />

// С текстом и вариантом
<Preloader
  variant="dots"
  size="lg"
  text="Loading..."
/>
```

### PagePreloader

Полноэкранный прелоадер для загрузки страниц.

```tsx
import { PagePreloader } from '@/components/ui/preloader'

;<PagePreloader text="Loading page..." variant="spinner" size="lg" />
```

### InlinePreloader

Встроенный прелоадер для контентных областей.

```tsx
import { InlinePreloader } from '@/components/ui/preloader'

;<InlinePreloader text="Loading content..." variant="wave" size="md" />
```

## Хуки

### usePreloader

Хук для управления состоянием прелоадера.

```tsx
import { usePreloader } from '@/hooks/usePreloader'

function MyComponent() {
  const preloader = usePreloader()

  const handleLoad = () => {
    preloader.show({ text: 'Loading...', variant: 'dots' })
    // ... выполнение операции
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

Хук для автоматического управления состоянием загрузки при асинхронных операциях.

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

## Параметры

### variant

Тип анимации прелоадера:

- `spinner` - вращающийся спиннер (по умолчанию)
- `dots` - анимированные точки
- `pulse` - пульсирующий круг
- `wave` - волновая анимация

### size

Размер прелоадера:

- `sm` - маленький
- `md` - средний (по умолчанию)
- `lg` - большой
- `xl` - очень большой

### text

Текст, отображаемый под прелоадером (опционально).

## Стилизация

Компоненты используют CSS переменные из вашей темы и автоматически адаптируются к светлой/темной теме.

## Анимации

Все анимации используют Framer Motion для плавных переходов. Анимации оптимизированы для производительности и доступности.

## Примеры использования

См. файл `src/components/examples/PreloaderDemo.tsx` для полных примеров использования всех компонентов и хуков.
