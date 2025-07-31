# 🚀 Настройка Vercel с Neon Database

## ✅ Что уже готово

- ✅ База данных Neon настроена и заполнена данными
- ✅ API роуты настроены для Vercel
- ✅ Все файлы готовы для деплоя

## 🔧 Настройка Vercel

### Шаг 1: Environment Variables

В настройках проекта Vercel добавьте следующие переменные:

```env
# Database (Neon)
DATABASE_URL=postgresql://neondb_owner:npg_4GbgI1ruPZft@ep-lucky-wave-a2xqt740-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Session
SESSION_SECRET=your_random_session_secret_here

# Google OAuth (если используете)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe (если используете)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# SMTP (если используете)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Шаг 2: Деплой

После добавления переменных окружения:

1. **Перейдите в Vercel Dashboard**
2. **Найдите ваш проект**
3. **Нажмите "Redeploy"**

### Шаг 3: Проверка

После деплоя проверьте:

- ✅ Сайт загружается: `https://laser-touch.vercel.app`
- ✅ Логин работает: `/login`
- ✅ API отвечает: `/api/health`

## 🎯 Результат

После успешного деплоя:
- ✅ Сайт будет работать с реальной базой данных
- ✅ Пользователи смогут войти в свои аккаунты
- ✅ Все функции будут доступны

## 🆘 Если что-то не работает

1. **Проверьте Environment Variables** в Vercel
2. **Проверьте логи деплоя** в Vercel Dashboard
3. **Убедитесь, что DATABASE_URL правильный**

## 📞 Поддержка

Если нужна помощь - проверьте логи в Vercel Dashboard или обратитесь к разработчику. 