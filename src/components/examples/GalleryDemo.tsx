'use client'

import { useState } from 'react'
import { GalleryViewer, GalleryCard } from '@/components/ui/GalleryViewer'
import GalleryEditable from '@/components/ui/GalleryEditable'
import { FullscreenGallery } from '@/components/modals/FullscreenGallery'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const sampleImages = [
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/800/600?random=3',
  'https://picsum.photos/800/600?random=4',
  'https://picsum.photos/800/600?random=5',
  'https://picsum.photos/800/600?random=6',
  'https://picsum.photos/800/600?random=7',
  'https://picsum.photos/800/600?random=8',
  'https://picsum.photos/800/600?random=9',
  'https://picsum.photos/800/600?random=10',
]

export function GalleryDemo() {
  const [editableImages, setEditableImages] = useState<string[]>([])
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleUpload = async (file: File) => {
    const imageUrl = URL.createObjectURL(file)
    setEditableImages(prev => [...prev, imageUrl])
  }

  const handleDelete = (imageToDelete: string) => {
    setEditableImages(prev => prev.filter(img => img !== imageToDelete))
    URL.revokeObjectURL(imageToDelete)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Демонстрация галереи</h1>
        <p className="text-muted-foreground">
          Примеры использования компонентов галереи с полноэкранным просмотром
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Простое открытие галереи</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={() => {
                setCurrentImageIndex(0)
                setIsGalleryOpen(true)
              }}
              variant="primary"
              size="lg"
            >
              Открыть галерею
            </Button>
            <FullscreenGallery
              images={sampleImages}
              title="Наши работы"
              isOpen={isGalleryOpen}
              onClose={() => setIsGalleryOpen(false)}
              currentIndex={currentImageIndex}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Редактируемая галерея</CardTitle>
        </CardHeader>
        <CardContent>
          <GalleryEditable
            images={editableImages}
            onUpload={handleUpload}
            onDelete={handleDelete}
            aspectRatio={4 / 3}
            showCrop={true}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Галерея для просмотра (3 колонки)</CardTitle>
        </CardHeader>
        <CardContent>
          <GalleryViewer
            images={sampleImages}
            title="Примеры работ"
            gridCols={3}
            aspectRatio="4/3"
            maxImages={6}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Квадратная галерея (4 колонки)</CardTitle>
        </CardHeader>
        <CardContent>
          <GalleryViewer
            images={sampleImages}
            title="Квадратные изображения"
            gridCols={4}
            aspectRatio="square"
            maxImages={8}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GalleryCard
          images={sampleImages.slice(0, 3)}
          title="Подкасты"
          subtitle="Наши лучшие работы в области подкастинга"
          aspectRatio="4/3"
        />
        <GalleryCard
          images={sampleImages.slice(3, 6)}
          title="Видеопродакшн"
          subtitle="Профессиональная видеосъемка и монтаж"
          aspectRatio="16/9"
        />
        <GalleryCard
          images={sampleImages.slice(6, 9)}
          title="Контент-стратегия"
          subtitle="Разработка стратегий для брендов"
          aspectRatio="square"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Как использовать</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Полноэкранная галерея:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                Кликните на любое изображение для открытия в полноэкранном
                режиме
              </li>
              <li>Используйте стрелки или клавиши ← → для навигации</li>
              <li>ESC или клик вне изображения для закрытия</li>
              <li>Колесо мыши или кнопки + - для зума</li>
              <li>Перетаскивайте изображение при зуме для панорамирования</li>
              <li>H - показать/скрыть миниатюры</li>
              <li>На мобильных: тап по левой/правой части для навигации</li>
              <li>Pinch-to-zoom на мобильных устройствах</li>
              <li>Адаптивный дизайн для всех размеров экранов</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Компоненты:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                <code>FullscreenGallery</code> - основной компонент с встроенным
                управлением состоянием
              </li>
              <li>
                <code>GalleryEditable</code> - галерея с возможностью загрузки и
                удаления
              </li>
              <li>
                <code>GalleryViewer</code> - галерея только для просмотра
              </li>
              <li>
                <code>GalleryCard</code> - карточка с превью и галереей
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
