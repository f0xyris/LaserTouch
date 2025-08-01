import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Функция для применения миграций
async function applyMigrations(pool: Pool) {
  try {
    const client = await pool.connect();
    
    // Проверяем, есть ли поле is_deleted_from_admin
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
      AND column_name = 'is_deleted_from_admin'
    `);
    
    if (checkResult.rows.length === 0) {
      // Добавляем поле
      await client.query(`
        ALTER TABLE appointments 
        ADD COLUMN is_deleted_from_admin boolean DEFAULT false
      `);

    } else {
      // Field already exists
    }
    
    // Исправляем старые записи
    const updateResult = await client.query(`
      UPDATE appointments 
      SET is_deleted_from_admin = true 
      WHERE status = 'deleted'
    `);
    
    if (updateResult.rowCount && updateResult.rowCount > 0) {
  
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Ошибка при применении миграций:', error);
  }
}

// Применяем миграции при инициализации
applyMigrations(pool);