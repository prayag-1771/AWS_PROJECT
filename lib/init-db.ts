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

    ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

    CREATE TABLE IF NOT EXISTS modules (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name VARCHAR(150) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      type VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Running',
      deployment VARCHAR(80) NOT NULL,
      database_engine VARCHAR(80) NOT NULL,
      storage VARCHAR(80) NOT NULL,
      networking VARCHAR(80) NOT NULL,
      security VARCHAR(80) NOT NULL,
      min_tasks INTEGER NOT NULL DEFAULT 1,
      max_tasks INTEGER NOT NULL DEFAULT 2,
      monitoring VARCHAR(80) NOT NULL,
      backup VARCHAR(80) NOT NULL,
      disaster_recovery VARCHAR(80) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS modules_project_id_idx ON modules (project_id);

    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(80) PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity (
      id SERIAL PRIMARY KEY,
      action VARCHAR(40) NOT NULL,
      entity VARCHAR(40) NOT NULL,
      entity_name VARCHAR(200) NOT NULL,
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
