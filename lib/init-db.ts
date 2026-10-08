import pool from "./db";

export async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      code VARCHAR(20) NOT NULL DEFAULT '',
      instructor VARCHAR(120) NOT NULL DEFAULT '',
      semester VARCHAR(50) NOT NULL,
      credits INTEGER NOT NULL DEFAULT 3,
      status VARCHAR(30) NOT NULL DEFAULT 'Ongoing',
      description TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS course_modules (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      position INTEGER NOT NULL DEFAULT 1,
      name VARCHAR(150) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      planned_hours INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS course_modules_course_id_idx
      ON course_modules (course_id);

    CREATE TABLE IF NOT EXISTS topics (
      id SERIAL PRIMARY KEY,
      module_id INTEGER NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      done BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS topics_module_id_idx ON topics (module_id);

    CREATE TABLE IF NOT EXISTS deadlines (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      type VARCHAR(30) NOT NULL,
      due_date DATE NOT NULL,
      done BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS deadlines_course_id_idx ON deadlines (course_id);

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
