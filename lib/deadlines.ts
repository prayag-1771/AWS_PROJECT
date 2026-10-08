import pool from "./db";
import { missingParent } from "./api";
import { ensureDatabase } from "./init-db";
import type { DeadlineInput } from "./validate";

export type Deadline = DeadlineInput & {
  id: number;
  course_name: string;
};

const SELECT = `
  SELECT d.id, d.course_id, d.title, d.type, d.due_date, d.done,
         c.name AS course_name
  FROM deadlines d
  JOIN courses c ON c.id = d.course_id
`;

function values(input: DeadlineInput) {
  return [input.course_id, input.title, input.type, input.due_date, input.done];
}

// Open deadlines come first, soonest first; finished ones sink to the bottom.
export async function listDeadlines(courseId?: number): Promise<Deadline[]> {
  await ensureDatabase();

  const order = "ORDER BY d.done, d.due_date, d.id";

  const result = courseId
    ? await pool.query(`${SELECT} WHERE d.course_id = $1 ${order}`, [courseId])
    : await pool.query(`${SELECT} ${order}`);

  return result.rows;
}

export async function getDeadline(id: number): Promise<Deadline | null> {
  await ensureDatabase();

  const result = await pool.query(`${SELECT} WHERE d.id = $1`, [id]);

  return result.rows[0] || null;
}

export async function createDeadline(input: DeadlineInput): Promise<number> {
  await ensureDatabase();

  const result = await pool
    .query(
      `INSERT INTO deadlines (course_id, title, type, due_date, done)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      values(input)
    )
    .catch(missingParent("Course"));

  return result.rows[0].id;
}

export async function updateDeadline(id: number, input: DeadlineInput) {
  await ensureDatabase();

  await pool
    .query(
      `UPDATE deadlines
       SET course_id = $1, title = $2, type = $3, due_date = $4, done = $5
       WHERE id = $6`,
      [...values(input), id]
    )
    .catch(missingParent("Course"));
}

export async function deleteDeadline(id: number): Promise<string | null> {
  await ensureDatabase();

  const result = await pool.query(
    "DELETE FROM deadlines WHERE id = $1 RETURNING title",
    [id]
  );

  return result.rows[0]?.title ?? null;
}
