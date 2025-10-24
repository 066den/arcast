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

## Создание админа и загрузка данных

### Подготовка окружения

```bash
# Создайте .env файл из примера
cp env.example .env

# Отредактируйте .env файл с вашими настройками
# Особенно важно настроить DATABASE_URL и другие переменные
```

### Запуск Docker контейнеров

```bash
# Запуск только базы данных PostgreSQL
docker-compose up -d postgres

# Или запуск всего приложения (включая базу данных)
docker-compose up -d
```

### Выполнение миграций базы данных

```bash
# Выполнение миграций Prisma
docker-compose exec app npx prisma migrate deploy

# Генерация Prisma клиента
docker-compose exec app npx prisma generate
```

### Восстановление данных из дампа

```bash
# Восстановление данных из JSON дампа
# Замените путь на ваш файл дампа
docker-compose exec app npm run db:restore backups/backup-2025-10-20T06-51-38-671Z.json

# Или если у вас есть .bak файл PostgreSQL
docker-compose exec postgres pg_restore -U postgres -d arcast_db /path/to/your/dump.bak
```

### Создание админа

```bash
# Создание админа с дефолтными данными (admin/admin123)
docker-compose exec app npm run admin:seed

# Или с кастомными данными через переменные окружения
docker-compose exec app -e ADMIN_USERNAME=myadmin -e SEED_ADMIN_PASSWORD=mypassword npm run admin:seed
```

### Проверка результата

```bash
# Проверка статуса контейнеров
docker-compose ps

# Просмотр логов приложения
docker-compose logs -f app

# Подключение к базе данных для проверки
docker-compose exec postgres psql -U postgres -d arcast_db
```

### Полная последовательность команд

```bash
# 1. Подготовка
cp env.example .env
# Отредактируйте .env файл

# 2. Запуск базы данных
docker-compose up -d postgres

# 3. Миграции
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma generate

# 4. Восстановление данных (выберите один из вариантов)
# Для JSON дампа:
docker-compose exec app npm run db:restore backups/backup-2025-10-20T06-51-38-671Z.json

# Для .bak файла:
docker-compose exec postgres pg_restore -U postgres -d arcast_db db_dump.bak

# 5. Создание админа
docker-compose exec app npm run admin:seed

# 6. Запуск приложения (если еще не запущено)
docker-compose up -d
```

### Дополнительные полезные команды

```bash
# Сброс пароля админа
docker-compose exec app npm run admin:reset-password

# Создание нового бэкапа
docker-compose exec app npm run db:backup

# Просмотр всех логов
docker-compose logs -f

# Остановка всех сервисов
docker-compose down

# Полная очистка (включая volumes)
docker-compose down -v
```

### Важные замечания

- Убедитесь, что файл дампа находится в папке `backups/` или укажите полный путь
- Для .bak файлов используйте `pg_restore` вместо JSON восстановления
- Админ создается с логином `admin` и паролем `admin123` по умолчанию
- После первого входа обязательно смените пароль админа

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
