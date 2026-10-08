import pool from "./db";
import { missingParent } from "./api";
import { ensureDatabase } from "./init-db";
import type { ModuleInput } from "./validate";

export type Module = ModuleInput & {
  id: number;
  course_name: string;
  course_code: string;
  topic_count: number;
  done_count: number;
  created_at: Date | string;
  updated_at: Date | string;
};

const SELECT = `
  SELECT m.*, c.name AS course_name, c.code AS course_code,
    (SELECT COUNT(*)::int FROM topics t WHERE t.module_id = m.id)
      AS topic_count,
    (SELECT COUNT(*)::int FROM topics t WHERE t.module_id = m.id AND t.done)
      AS done_count
  FROM course_modules m
  JOIN courses c ON c.id = m.course_id
`;

function values(input: ModuleInput) {
  return [
    input.course_id,
    input.position,
    input.name,
    input.description,
    input.planned_hours,
  ];
}

export async function listModules(courseId?: number): Promise<Module[]> {
  await ensureDatabase();

  const result = courseId
    ? await pool.query(
        `${SELECT} WHERE m.course_id = $1 ORDER BY m.position, m.id`,
        [courseId]
      )
    : await pool.query(`${SELECT} ORDER BY c.name, c.id, m.position, m.id`);

  return result.rows;
}

export async function getModule(id: number): Promise<Module | null> {
  await ensureDatabase();

  const result = await pool.query(`${SELECT} WHERE m.id = $1`, [id]);

  return result.rows[0] || null;
}

export async function createModule(input: ModuleInput): Promise<number> {
  await ensureDatabase();

  const result = await pool
    .query(
      `INSERT INTO course_modules
       (course_id, position, name, description, planned_hours)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      values(input)
    )
    .catch(missingParent("Course"));

  return result.rows[0].id;
}

export async function updateModule(id: number, input: ModuleInput) {
  await ensureDatabase();

  await pool
    .query(
      `UPDATE course_modules
       SET course_id = $1, position = $2, name = $3, description = $4,
           planned_hours = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [...values(input), id]
    )
    .catch(missingParent("Course"));
}

export async function deleteModule(id: number): Promise<string | null> {
  await ensureDatabase();

  const result = await pool.query(
    "DELETE FROM course_modules WHERE id = $1 RETURNING name",
    [id]
  );

  return result.rows[0]?.name ?? null;
}
