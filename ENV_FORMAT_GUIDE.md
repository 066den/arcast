# 📝 Правильный формат переменных окружения

## ✅ Правильно (без кавычек)

```env
AWS_REGION=nyc3
AWS_ENDPOINT=https://nyc3.digitaloceanspaces.com
AWS_ACCESS_KEY_ID=DO801ZANC8M4JR4ANL7Z
AWS_SECRET_ACCESS_KEY=R1umCcwzZQtooGLR1eccRTNh0KBVqrptLZVpWlEmZEo
AWS_S3_BUCKET_NAME=arcast-s3
```

## ❌ Неправильно (с кавычками)

```env
AWS_REGION="nyc3"
AWS_ENDPOINT="https://nyc3.digitaloceanspaces.com"
AWS_ACCESS_KEY_ID="DO801ZANC8M4JR4ANL7Z"
AWS_SECRET_ACCESS_KEY="R1umCcwzZQtooGLR1eccRTNh0KBVqrptLZVpWlEmZEo"
AWS_S3_BUCKET_NAME="arcast-s3"
```

## 🔍 Почему без кавычек?

1. **Стандарт .env файлов**: Переменные окружения в .env файлах обычно не используют кавычки
2. **Node.js**: Библиотеки для загрузки .env файлов автоматически обрабатывают значения
3. **Консистентность**: Все переменные должны быть в одном формате
4. **Избежание ошибок**: Кавычки могут вызывать проблемы с парсингом

## ⚠️ Исключения

Кавычки нужны только если значение содержит:

- Пробелы: `DATABASE_URL="postgresql://user:pass with spaces@localhost/db"`
- Специальные символы: `SECRET_KEY="key-with-special-chars!@#$"`

## 🔧 Как исправить

Если у вас есть кавычки в .env.local:

```bash
# Удалить все кавычки из AWS переменных
(Get-Content .env.local) -replace 'AWS_REGION="nyc3"', 'AWS_REGION=nyc3' -replace 'AWS_ENDPOINT="https://nyc3.digitaloceanspaces.com"', 'AWS_ENDPOINT=https://nyc3.digitaloceanspaces.com' -replace 'AWS_S3_BUCKET_NAME="arcast-s3"', 'AWS_S3_BUCKET_NAME=arcast-s3' | Set-Content .env.local
```

## ✅ Проверка

После исправления запустите:

```bash
npm run test:s3
```

Переменные должны отображаться без кавычек в выводе.
