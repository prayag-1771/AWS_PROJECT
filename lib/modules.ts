import pool from "./db";
import { ApiError, missingParent } from "./api";
import { ownsCourse } from "./courses";
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

async function requireCourse(owner: string, courseId: number) {
  if (!(await ownsCourse(owner, courseId))) {
    throw new ApiError("Course not found");
  }
}

export async function listModules(
  owner: string,
  courseId?: number
): Promise<Module[]> {
  await ensureDatabase();

  const result = courseId
    ? await pool.query(
        `${SELECT} WHERE c.owner = $1 AND m.course_id = $2
         ORDER BY m.position, m.id`,
        [owner, courseId]
      )
    : await pool.query(
        `${SELECT} WHERE c.owner = $1 ORDER BY c.name, c.id, m.position, m.id`,
        [owner]
      );

  return result.rows;
}

export async function getModule(
  owner: string,
  id: number
): Promise<Module | null> {
  await ensureDatabase();

  const result = await pool.query(
    `${SELECT} WHERE m.id = $1 AND c.owner = $2`,
    [id, owner]
  );

  return result.rows[0] || null;
}

export async function createModule(
  owner: string,
  input: ModuleInput
): Promise<number> {
  await requireCourse(owner, input.course_id);

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

export async function updateModule(
  owner: string,
  id: number,
  input: ModuleInput
) {
  await requireCourse(owner, input.course_id);

  await pool
    .query(
      `UPDATE course_modules m
       SET course_id = $1, position = $2, name = $3, description = $4,
           planned_hours = $5, updated_at = CURRENT_TIMESTAMP
       FROM courses c
       WHERE m.id = $6 AND c.id = m.course_id AND c.owner = $7`,
      [...values(input), id, owner]
    )
    .catch(missingParent("Course"));
}

export async function deleteModule(
  owner: string,
  id: number
): Promise<string | null> {
  await ensureDatabase();

  const result = await pool.query(
    `DELETE FROM course_modules m USING courses c
     WHERE m.id = $1 AND c.id = m.course_id AND c.owner = $2
     RETURNING m.name`,
    [id, owner]
  );

  return result.rows[0]?.name ?? null;
}
