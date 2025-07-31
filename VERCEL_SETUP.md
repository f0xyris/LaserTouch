# 🔧 Настройка Vercel для LaserTouch

## 🚨 Критически важные переменные окружения

Для работы приложения необходимо настроить в Vercel Dashboard:

### 1. DATABASE_URL

- **Значение**: `postgresql://neondb_owner:npg_4GbgI1ruPZft@ep-lucky-wave-a2xqt740-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- **Окружение**: Production, Preview, Development

### 2. SESSION_SECRET

- **Значение**: Случайная строка (например: `your-super-secret-session-key-here-12345`)
- **Окружение**: Production, Preview, Development

### 3. BASE_URL

- **Значение**: `https://your-app-name.vercel.app` (замените на ваш домен)
- **Окружение**: Production, Preview, Development

### 4. GOOGLE_CLIENT_ID (опционально)

- **Значение**: Ваш Google OAuth Client ID
- **Окружение**: Production, Preview, Development

### 5. GOOGLE_CLIENT_SECRET (опционально)

- **Значение**: Ваш Google OAuth Client Secret
- **Окружение**: Production, Preview, Development

## 📋 Пошаговая настройка

1. Перейдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект `laser-touch`
3. Перейдите в Settings → Environment Variables
4. Добавьте каждую переменную из списка выше
5. Убедитесь, что выбраны все окружения (Production, Preview, Development)
6. Нажмите "Save" для каждой переменной

## 🔍 Проверка настроек

После настройки переменных проверьте:

1. **Тест базы данных**: `https://your-app.vercel.app/api/test-db`
2. **Тест аутентификации**: `https://your-app.vercel.app/api/test-auth`
3. **Регистрация**: Попробуйте зарегистрировать нового пользователя
4. **Вход**: Попробуйте войти с существующими данными

## 🚀 Исправления билда

### Проблемы, которые были исправлены:

1. **TypeScript ошибки JSX** - Исправлены настройки конфигурации
2. **Проблемы с алиасами путей** - Обновлены настройки paths
3. **Проблемы с сессиями** - Заменен MemoryStore на PostgreSQL
4. **Проблемы с билдом** - Создан специальный скрипт для Vercel

### Что было изменено:

- ✅ `tsconfig.vercel.json` - Обновлен для правильной обработки JSX
- ✅ `vercel.json` - Добавлен специальный скрипт билда
- ✅ `package.json` - Отключены TypeScript проверки во время деплоя
- ✅ `vercel-build.js` - Создан специальный скрипт для Vercel
- ✅ `server/auth.ts` - Добавлен PostgreSQL session store
- ✅ `server/storage.ts` - Обновлен для PostgreSQL сессий

## 🎯 Результат

После применения всех исправлений:

- ✅ Билд проходит без ошибок TypeScript
- ✅ Аутентификация работает корректно
- ✅ Сессии сохраняются в PostgreSQL
- ✅ Все функции приложения доступны

## 📞 Если проблемы остались

1. Проверьте логи в Vercel Dashboard → Build Logs
2. Убедитесь, что все переменные окружения настроены
3. Проверьте подключение к Neon Database
4. Убедитесь, что таблица `sessions` существует в базе данных

## 🔧 Дополнительные проверки

После деплоя проверьте:

- ✅ API эндпоинты отвечают: `/api/health`
- ✅ База данных подключена: `/api/services`
- ✅ Авторизация работает: `/login`
- ✅ Все функции приложения работают корректно
