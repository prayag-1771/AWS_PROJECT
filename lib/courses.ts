import pool from "./db";
import { ensureDatabase } from "./init-db";
import type { CourseInput } from "./validate";

export type Course = CourseInput & {
  id: number;
  created_at: Date | string;
  updated_at: Date | string;
  module_count: number;
  topic_count: number;
  done_count: number;
};

// Topic counts are what a course's progress is calculated from.
const SELECT = `
  SELECT c.*,
    (SELECT COUNT(*)::int FROM course_modules m WHERE m.course_id = c.id)
      AS module_count,
    (SELECT COUNT(*)::int FROM topics t
       JOIN course_modules m ON m.id = t.module_id
      WHERE m.course_id = c.id) AS topic_count,
    (SELECT COUNT(*)::int FROM topics t
       JOIN course_modules m ON m.id = t.module_id
      WHERE m.course_id = c.id AND t.done) AS done_count
  FROM courses c
`;

function values(input: CourseInput) {
  return [
    input.name,
    input.code,
    input.instructor,
    input.semester,
    input.credits,
    input.status,
    input.description,
  ];
}

export async function listCourses(owner: string): Promise<Course[]> {
  await ensureDatabase();

  const result = await pool.query(
    `${SELECT} WHERE c.owner = $1 ORDER BY c.created_at DESC, c.id DESC`,
    [owner]
  );

  return result.rows;
}

export async function getCourse(
  owner: string,
  id: number
): Promise<Course | null> {
  await ensureDatabase();

  const result = await pool.query(
    `${SELECT} WHERE c.id = $1 AND c.owner = $2`,
    [id, owner]
  );

  return result.rows[0] || null;
}

export async function ownsCourse(owner: string, id: number) {
  await ensureDatabase();

  const result = await pool.query(
    "SELECT 1 FROM courses WHERE id = $1 AND owner = $2",
    [id, owner]
  );

  return result.rowCount === 1;
}

export async function createCourse(
  owner: string,
  input: CourseInput
): Promise<number> {
  await ensureDatabase();

  const result = await pool.query(
    `INSERT INTO courses
     (name, code, instructor, semester, credits, status, description, owner)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [...values(input), owner]
  );

  return result.rows[0].id;
}

export async function updateCourse(
  owner: string,
  id: number,
  input: CourseInput
) {
  await ensureDatabase();

  await pool.query(
    `UPDATE courses
     SET name = $1, code = $2, instructor = $3, semester = $4, credits = $5,
         status = $6, description = $7, updated_at = CURRENT_TIMESTAMP
     WHERE id = $8 AND owner = $9`,
    [...values(input), id, owner]
  );
}

export async function deleteCourse(
  owner: string,
  id: number
): Promise<string | null> {
  await ensureDatabase();

  const result = await pool.query(
    "DELETE FROM courses WHERE id = $1 AND owner = $2 RETURNING name",
    [id, owner]
  );

  return result.rows[0]?.name ?? null;
}
