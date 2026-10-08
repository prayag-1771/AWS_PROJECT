import pool from "./db";
import { ensureDatabase } from "./init-db";
import type { ProjectInput } from "./validate";

export type Project = {
  id: number;
  name: string;
  description: string;
  environment: string;
  architecture: string;
  region: string;
  status: string;
  created_at: Date | string;
  updated_at: Date | string;
  module_count: number;
};

const SELECT = `
  SELECT p.*, COUNT(m.id)::int AS module_count
  FROM projects p
  LEFT JOIN modules m ON m.project_id = p.id
`;

export async function listProjects(): Promise<Project[]> {
  await ensureDatabase();

  const result = await pool.query(
    `${SELECT} GROUP BY p.id ORDER BY p.created_at DESC, p.id DESC`
  );

  return result.rows;
}

export async function getProject(id: number): Promise<Project | null> {
  await ensureDatabase();

  const result = await pool.query(`${SELECT} WHERE p.id = $1 GROUP BY p.id`, [
    id,
  ]);

  return result.rows[0] || null;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  await ensureDatabase();

  const result = await pool.query(
    `INSERT INTO projects
     (name, description, environment, architecture, region, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *, 0 AS module_count`,
    [
      input.name,
      input.description,
      input.environment,
      input.architecture,
      input.region,
      input.status,
    ]
  );

  return result.rows[0];
}

export async function updateProject(
  id: number,
  input: ProjectInput
): Promise<boolean> {
  await ensureDatabase();

  const result = await pool.query(
    `UPDATE projects
     SET name = $1, description = $2, environment = $3, architecture = $4,
         region = $5, status = $6, updated_at = CURRENT_TIMESTAMP
     WHERE id = $7`,
    [
      input.name,
      input.description,
      input.environment,
      input.architecture,
      input.region,
      input.status,
      id,
    ]
  );

  return result.rowCount === 1;
}

export async function deleteProject(id: number): Promise<Project | null> {
  await ensureDatabase();

  const result = await pool.query(
    "DELETE FROM projects WHERE id = $1 RETURNING *, 0 AS module_count",
    [id]
  );

  return result.rows[0] || null;
}
