import pool from "./db";

export async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      environment VARCHAR(50) NOT NULL,
      architecture VARCHAR(50) NOT NULL,
      region VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

let ready: Promise<void> | null = null;

export function ensureDatabase() {
  if (!ready) {
    ready = initDatabase().catch((error) => {
      ready = null;
      throw error;
    });
  }

  return ready;
}
