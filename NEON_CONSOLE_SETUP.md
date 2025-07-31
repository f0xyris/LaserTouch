# 🖥️ Настройка Neon через веб-консоль

## Шаг 1: Откройте Neon Console

1. Перейдите на [console.neon.tech](https://console.neon.tech)
2. Войдите в свой аккаунт
3. Выберите проект `lasertouch-db`

## Шаг 2: Создайте схему через SQL Editor

1. В левом меню найдите "SQL Editor"
2. Нажмите "New Query"
3. Скопируйте и вставьте следующий SQL код:

```sql
-- LaserTouch Database Schema
-- Создание таблиц для салона красоты

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR, -- For local auth, null for OAuth
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    google_id VARCHAR UNIQUE, -- For Google OAuth
    phone TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name JSONB NOT NULL,
    description JSONB NOT NULL,
    price INTEGER NOT NULL, -- price in kopecks
    duration INTEGER NOT NULL, -- duration in minutes
    category TEXT NOT NULL -- 'laser', 'massage', 'spa', 'training'
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    service_id INTEGER REFERENCES services(id) NOT NULL,
    appointment_date TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    notes TEXT,
    is_deleted_from_admin BOOLEAN DEFAULT FALSE,
    client_name VARCHAR,
    client_phone VARCHAR,
    client_email VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    service_id INTEGER REFERENCES services(id),
    name VARCHAR,
    rating INTEGER NOT NULL, -- 1-5 stars
    comment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name JSONB NOT NULL,
    description JSONB NOT NULL,
    price INTEGER NOT NULL, -- price in kopecks
    duration INTEGER NOT NULL, -- duration in hours
    category TEXT NOT NULL,
    image_url TEXT
);

-- Insert sample data
INSERT INTO services (name, description, price, duration, category) VALUES
('{"en": "Laser Hair Removal", "pl": "Depilacja laserowa"}', '{"en": "Professional laser hair removal treatment", "pl": "Profesjonalna depilacja laserowa"}', 15000, 30, 'laser'),
('{"en": "Swedish Massage", "pl": "Masaż szwedzki"}', '{"en": "Relaxing Swedish massage", "pl": "Relaksujący masaż szwedzki"}', 8000, 60, 'massage'),
('{"en": "Facial Treatment", "pl": "Zabieg na twarz"}', '{"en": "Rejuvenating facial treatment", "pl": "Odżywczy zabieg na twarz"}', 12000, 45, 'spa');

INSERT INTO courses (name, description, price, duration, category, image_url) VALUES
('{"en": "Beauty Therapy Course", "pl": "Kurs terapii piękności"}', '{"en": "Learn professional beauty treatments", "pl": "Naucz się profesjonalnych zabiegów piękności"}', 50000, 40, 'training', '/images/course1.jpg'),
('{"en": "Massage Therapy", "pl": "Terapia masażu"}', '{"en": "Professional massage therapy course", "pl": "Profesjonalny kurs terapii masażu"}', 35000, 30, 'training', '/images/course2.jpg');
```

4. Нажмите "Run" для выполнения SQL

## Шаг 3: Проверьте созданные таблицы

1. В SQL Editor выполните:

```sql
\dt
```

2. Проверьте данные:

```sql
SELECT 'services' as table_name, COUNT(*) as count FROM services
UNION ALL
SELECT 'courses' as table_name, COUNT(*) as count FROM courses;
```

## Шаг 4: Настройте Vercel

1. Перейдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите проект `laser-touch`
3. Settings → Environment Variables
4. Добавьте переменную:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_4GbgI1ruPZft@ep-lucky-wave-a2xqt740-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - **Environment**: Production, Preview, Development
5. Нажмите "Save"

## Шаг 5: Перезапустите деплой

1. В Vercel Dashboard → Deployments
2. Найдите последний деплой
3. Нажмите "Redeploy"

## ✅ Проверка

После настройки проверьте:

- [ ] Регистрация пользователей работает
- [ ] Вход через email/password работает
- [ ] Google OAuth работает
- [ ] Создание бронирований работает
