import pool from "./db";
import { ApiError, missingParent } from "./api";
import { ownsCourse } from "./courses";
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

async function requireCourse(owner: string, courseId: number) {
  if (!(await ownsCourse(owner, courseId))) {
    throw new ApiError("Course not found");
  }
}

// Open deadlines come first, soonest first; finished ones sink to the bottom.
export async function listDeadlines(
  owner: string,
  courseId?: number
): Promise<Deadline[]> {
  await ensureDatabase();

  const order = "ORDER BY d.done, d.due_date, d.id";

  const result = courseId
    ? await pool.query(
        `${SELECT} WHERE c.owner = $1 AND d.course_id = $2 ${order}`,
        [owner, courseId]
      )
    : await pool.query(`${SELECT} WHERE c.owner = $1 ${order}`, [owner]);

  return result.rows;
}

export async function getDeadline(
  owner: string,
  id: number
): Promise<Deadline | null> {
  await ensureDatabase();

  const result = await pool.query(
    `${SELECT} WHERE d.id = $1 AND c.owner = $2`,
    [id, owner]
  );

  return result.rows[0] || null;
}

export async function createDeadline(
  owner: string,
  input: DeadlineInput
): Promise<number> {
  await requireCourse(owner, input.course_id);

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

export async function updateDeadline(
  owner: string,
  id: number,
  input: DeadlineInput
) {
  await requireCourse(owner, input.course_id);

  await pool
    .query(
      `UPDATE deadlines d
       SET course_id = $1, title = $2, type = $3, due_date = $4, done = $5
       FROM courses c
       WHERE d.id = $6 AND c.id = d.course_id AND c.owner = $7`,
      [...values(input), id, owner]
    )
    .catch(missingParent("Course"));
}

export async function deleteDeadline(
  owner: string,
  id: number
): Promise<string | null> {
  await ensureDatabase();

  const result = await pool.query(
    `DELETE FROM deadlines d USING courses c
     WHERE d.id = $1 AND c.id = d.course_id AND c.owner = $2
     RETURNING d.title`,
    [id, owner]
  );

  return result.rows[0]?.title ?? null;
}
