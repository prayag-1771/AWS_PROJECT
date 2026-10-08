import pool from "./db";
import { ApiError } from "./api";
import { ensureDatabase } from "./init-db";
import type { ModuleInput } from "./validate";

export type Module = ModuleInput & {
  id: number;
  project_name: string;
  created_at: Date | string;
  updated_at: Date | string;
};

const SELECT = `
  SELECT m.*, p.name AS project_name
  FROM modules m
  JOIN projects p ON p.id = m.project_id
`;

const COLUMNS = [
  "project_id",
  "name",
  "description",
  "type",
  "status",
  "deployment",
  "database_engine",
  "storage",
  "networking",
  "security",
  "min_tasks",
  "max_tasks",
  "monitoring",
  "backup",
  "disaster_recovery",
] as const;

function values(input: ModuleInput) {
  return COLUMNS.map((column) => input[column]);
}

// A module must belong to a project that still exists.
function projectMissing(error: unknown): never {
  if ((error as { code?: string })?.code === "23503") {
    throw new ApiError("Project not found");
  }

  throw error;
}

export async function listModules(projectId?: number): Promise<Module[]> {
  await ensureDatabase();

  const result = projectId
    ? await pool.query(
        `${SELECT} WHERE m.project_id = $1 ORDER BY m.created_at, m.id`,
        [projectId]
      )
    : await pool.query(`${SELECT} ORDER BY m.created_at DESC, m.id DESC`);

  return result.rows;
}

export async function getModule(id: number): Promise<Module | null> {
  await ensureDatabase();

  const result = await pool.query(`${SELECT} WHERE m.id = $1`, [id]);

  return result.rows[0] || null;
}

export async function createModule(input: ModuleInput): Promise<number> {
  await ensureDatabase();

  const placeholders = COLUMNS.map((_, index) => `$${index + 1}`).join(", ");

  const result = await pool
    .query(
      `INSERT INTO modules (${COLUMNS.join(", ")})
       VALUES (${placeholders})
       RETURNING id`,
      values(input)
    )
    .catch(projectMissing);

  return result.rows[0].id;
}

export async function updateModule(id: number, input: ModuleInput) {
  await ensureDatabase();

  const assignments = COLUMNS.map(
    (column, index) => `${column} = $${index + 1}`
  ).join(", ");

  await pool
    .query(
      `UPDATE modules
       SET ${assignments}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${COLUMNS.length + 1}`,
      [...values(input), id]
    )
    .catch(projectMissing);
}

export async function deleteModule(id: number): Promise<Module | null> {
  await ensureDatabase();

  const result = await pool.query(
    "DELETE FROM modules WHERE id = $1 RETURNING *, '' AS project_name",
    [id]
  );

  return result.rows[0] || null;
}
