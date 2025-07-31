# 🔍 Как проверить базу данных в Neon

## Способ 1: Через Neon Console (веб-интерфейс)

### Шаг 1: Откройте Neon Console

1. Перейдите на [console.neon.tech](https://console.neon.tech)
2. Войдите в свой аккаунт
3. Выберите проект `lasertouch-db`

### Шаг 2: Проверьте таблицы

1. В левом меню найдите **"Tables"**
2. Вы должны увидеть 6 таблиц:
   - `appointments`
   - `courses`
   - `reviews`
   - `services`
   - `sessions`
   - `users`

### Шаг 3: Проверьте данные через SQL Editor

1. В левом меню найдите **"SQL Editor"**
2. Нажмите **"New Query"**
3. Выполните следующие запросы:

```sql
-- Проверка всех таблиц
\dt

-- Проверка данных в услугах
SELECT * FROM services;

-- Проверка данных в курсах
SELECT * FROM courses;

-- Подсчет записей в каждой таблице
SELECT 'services' as table_name, COUNT(*) as count FROM services
UNION ALL
SELECT 'courses' as table_name, COUNT(*) as count FROM courses
UNION ALL
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'appointments' as table_name, COUNT(*) as count FROM appointments
UNION ALL
SELECT 'reviews' as table_name, COUNT(*) as count FROM reviews
UNION ALL
SELECT 'sessions' as table_name, COUNT(*) as count FROM sessions;
```

## Способ 2: Через Node.js скрипт

Запустите скрипт проверки:

```bash
node check_neon_database.cjs
```

## Способ 3: Через командную строку (если установлен psql)

```bash
psql "postgresql://neondb_owner:npg_4GbgI1ruPZft@ep-lucky-wave-a2xqt740-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" -c "\dt"
```

## ✅ Что вы должны увидеть

### В Neon Console:

- **Tables**: 6 таблиц
- **Services**: 3 записи (Laser Hair Removal, Swedish Massage, Facial Treatment)
- **Courses**: 2 записи (Beauty Therapy Course, Massage Therapy)
- **Users**: 0 записей (пока нет пользователей)
- **Appointments**: 0 записей (пока нет бронирований)

### В SQL Editor:

```
 table_name   | count
--------------+-------
 services     |     3
 courses      |     2
 users        |     0
 appointments |     0
 reviews      |     0
 sessions     |     0
```

## 🎯 Если база данных не найдена

1. **Проверьте проект**: Убедитесь, что вы выбрали правильный проект `lasertouch-db`
2. **Проверьте ветку**: Убедитесь, что вы находитесь в основной ветке (main)
3. **Проверьте регион**: Убедитесь, что проект в регионе `eu-central-1`

## 📊 Дополнительная информация

В Neon Console вы также можете увидеть:

- **Connection Details**: строка подключения
- **Metrics**: использование ресурсов
- **Logs**: логи подключений
- **Branches**: ветки базы данных

## 🔧 Если нужно пересоздать базу данных

Если таблицы не найдены, запустите скрипт настройки:

```bash
node setup_neon_db.cjs
```

Это создаст все таблицы и добавит тестовые данные.
