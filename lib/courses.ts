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

export async function listCourses(): Promise<Course[]> {
  await ensureDatabase();

  const result = await pool.query(
    `${SELECT} ORDER BY c.created_at DESC, c.id DESC`
  );

  return result.rows;
}

export async function getCourse(id: number): Promise<Course | null> {
  await ensureDatabase();

  const result = await pool.query(`${SELECT} WHERE c.id = $1`, [id]);

  return result.rows[0] || null;
}

export async function createCourse(input: CourseInput): Promise<number> {
  await ensureDatabase();

  const result = await pool.query(
    `INSERT INTO courses
     (name, code, instructor, semester, credits, status, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    values(input)
  );

  return result.rows[0].id;
}

export async function updateCourse(id: number, input: CourseInput) {
  await ensureDatabase();

  await pool.query(
    `UPDATE courses
     SET name = $1, code = $2, instructor = $3, semester = $4, credits = $5,
         status = $6, description = $7, updated_at = CURRENT_TIMESTAMP
     WHERE id = $8`,
    [...values(input), id]
  );
}

export async function deleteCourse(id: number): Promise<string | null> {
  await ensureDatabase();

  const result = await pool.query(
    "DELETE FROM courses WHERE id = $1 RETURNING name",
    [id]
  );

  return result.rows[0]?.name ?? null;
}
