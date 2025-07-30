# Развертывание на Vercel

## 🚀 Быстрое развертывание

### 1. **Установите Vercel CLI**

```bash
npm install -g vercel
```

### 2. **Войдите в Vercel**

```bash
vercel login
```

### 3. **Разверните проект**

```bash
vercel
```

### 4. **Настройте переменные окружения**

После развертывания перейдите в [Vercel Dashboard](https://vercel.com/dashboard) и добавьте переменные окружения:

```env
# Database
DATABASE_URL=your_postgresql_url

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Session
SESSION_SECRET=your_session_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Translation (optional)
GOOGLE_TRANSLATE_API_KEY=your_google_translate_key
YANDEX_TRANSLATE_API_KEY=your_yandex_translate_key
```

## 🔧 Альтернативный способ через GitHub

### 1. **Загрузите код в GitHub**

### 2. **Подключите к Vercel**

- Перейдите на [vercel.com](https://vercel.com)
- Нажмите "New Project"
- Выберите ваш GitHub репозиторий
- Настройте переменные окружения
- Разверните

## 🌐 Получение URL для Stripe Webhook

После развертывания вы получите URL вида:

```
https://your-project.vercel.app
```

### Используйте этот URL для Stripe webhook:

```
https://your-project.vercel.app/api/webhook/stripe
```

## ✅ Проверка развертывания

1. **Откройте ваш сайт:** `https://your-project.vercel.app`
2. **Проверьте API:** `https://your-project.vercel.app/api/services`
3. **Протестируйте email:** В админке → Email Test

## 🔄 Обновления

Для обновления сайта:

```bash
vercel --prod
```

## 📝 Важные замечания

- **База данных:** Убедитесь, что PostgreSQL доступна из интернета
- **Файлы:** Загруженные файлы не сохраняются между развертываниями
- **Sessions:** Используйте внешнее хранилище сессий для продакшена
- **SSL:** Vercel автоматически предоставляет SSL сертификаты

## 🛠️ Устранение неполадок

### Ошибка сборки

```bash
# Проверьте локальную сборку
npm run build
```

### Проблемы с базой данных

- Убедитесь, что DATABASE_URL правильный
- Проверьте доступность базы данных

### Email не работает

- Проверьте SMTP настройки в переменных окружения
- Убедитесь, что пароль приложения правильный
