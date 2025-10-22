# Docker Setup для Arcast

Этот документ описывает как настроить и использовать Docker для проекта Arcast.

## Структура Docker файлов

- `Dockerfile` - основной production образ
- `Dockerfile.dev` - образ для разработки
- `Dockerfile.prod` - оптимизированный production образ
- `docker-compose.yml` - оркестрация сервисов
- `.dockerignore` - файлы исключаемые из Docker контекста

## Быстрый старт

### 1. Production окружение

```bash
# Запуск production сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f app

# Остановка сервисов
docker-compose down
```

### 2. Development окружение

```bash
# Запуск development сервисов
docker-compose --profile dev up -d

# Просмотр логов
docker-compose logs -f app-dev

# Остановка сервисов
docker-compose down
```

### 3. Полное окружение с Nginx

```bash
# Запуск всех сервисов включая Nginx
docker-compose --profile production up -d
```

## Сервисы

### App (Production)

- **Порт**: 3000
- **Dockerfile**: `Dockerfile`
- **Health check**: `http://localhost:3000/api/health`

### App-dev (Development)

- **Порт**: 3001
- **Dockerfile**: `Dockerfile.dev`
- **Volumes**: Hot reload с локальными файлами
- **Health check**: `http://localhost:3001/api/health`

### PostgreSQL

- **Порт**: 5432
- **Database**: arcast
- **User**: postgres
- **Password**: postgres

### Nginx (Optional)

- **Порт**: 80
- **Profile**: production
- **Config**: `nginx.conf`

## Переменные окружения

Основные переменные окружения настроены в `docker-compose.yml`:

```yaml
DATABASE_URL: postgresql://postgres:postgres@postgres:5432/arcast
NEXTAUTH_SECRET: your-nextauth-secret-key-change-this-in-production
NEXTAUTH_URL: http://localhost:3000
NEXT_PUBLIC_APP_URL: http://localhost:3000
```

Для production окружения создайте `.env` файл с реальными значениями:

```bash
# Скопируйте env.example и настройте переменные
cp env.example .env
```

## Команды для разработки

### Пересборка образов

```bash
# Пересборка production образа
docker-compose build app

# Пересборка development образа
docker-compose build app-dev

# Пересборка всех образов
docker-compose build
```

### Работа с базой данных

```bash
# Подключение к базе данных
docker-compose exec postgres psql -U postgres -d arcast

# Выполнение миграций
docker-compose exec app npx prisma migrate deploy

# Генерация Prisma клиента
docker-compose exec app npx prisma generate
```

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f app
docker-compose logs -f postgres
```

## Troubleshooting

### Проблемы с портами

Если порты заняты, измените их в `docker-compose.yml`:

```yaml
ports:
  - '3002:3000' # Измените 3000 на свободный порт
```

### Проблемы с базой данных

```bash
# Пересоздание volume базы данных
docker-compose down -v
docker-compose up -d postgres
```

### Проблемы с кэшем

```bash
# Очистка Docker кэша
docker system prune -a

# Пересборка без кэша
docker-compose build --no-cache
```

## Production развертывание

### 1. Подготовка

```bash
# Создайте .env файл с production переменными
cp env.example .env
# Отредактируйте .env файл
```

### 2. Запуск

```bash
# Запуск production окружения
docker-compose --profile production up -d
```

### 3. Мониторинг

```bash
# Проверка статуса сервисов
docker-compose ps

# Проверка health checks
docker-compose exec app curl -f http://localhost:3000/api/health
```

## Безопасность

⚠️ **Важно для production**:

1. Измените пароли по умолчанию
2. Используйте сильные секретные ключи
3. Настройте SSL/TLS
4. Ограничьте доступ к портам базы данных
5. Регулярно обновляйте образы

## Производительность

### Оптимизация образов

- Используется multi-stage build для уменьшения размера
- Кэширование слоев Docker
- Исключение ненужных файлов через `.dockerignore`

### Мониторинг ресурсов

```bash
# Использование ресурсов
docker stats

# Информация об образах
docker images
```
