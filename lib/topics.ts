import pool from "./db";
import { ApiError, missingParent } from "./api";
import { ensureDatabase } from "./init-db";
import type { TopicInput } from "./validate";

export type Topic = {
  id: number;
  module_id: number;
  title: string;
  done: boolean;
};

// Joins that limit a topic to modules of the signed-in student's courses.
const OWNED = `
  JOIN course_modules m ON m.id = t.module_id
  JOIN courses c ON c.id = m.course_id
`;

export async function listTopics(
  owner: string,
  moduleId: number
): Promise<Topic[]> {
  await ensureDatabase();

  const result = await pool.query(
    `SELECT t.id, t.module_id, t.title, t.done FROM topics t ${OWNED}
     WHERE t.module_id = $1 AND c.owner = $2 ORDER BY t.id`,
    [moduleId, owner]
  );

  return result.rows;
}

export async function createTopic(
  owner: string,
  input: TopicInput
): Promise<Topic> {
  await ensureDatabase();

  const owned = await pool.query(
    `SELECT 1 FROM course_modules m JOIN courses c ON c.id = m.course_id
     WHERE m.id = $1 AND c.owner = $2`,
    [input.module_id, owner]
  );

  if (owned.rowCount !== 1) {
    throw new ApiError("Module not found");
  }

  const result = await pool
    .query(
      `INSERT INTO topics (module_id, title) VALUES ($1, $2)
       RETURNING id, module_id, title, done`,
      [input.module_id, input.title]
    )
    .catch(missingParent("Module"));

  return result.rows[0];
}

export async function setTopicDone(
  owner: string,
  id: number,
  done: boolean
): Promise<Topic | null> {
  await ensureDatabase();

  const result = await pool.query(
    `UPDATE topics t SET done = $1
     FROM course_modules m, courses c
     WHERE t.id = $2 AND m.id = t.module_id AND c.id = m.course_id
       AND c.owner = $3
     RETURNING t.id, t.module_id, t.title, t.done`,
    [done, id, owner]
  );

  return result.rows[0] || null;
}

export async function deleteTopic(
  owner: string,
  id: number
): Promise<string | null> {
  await ensureDatabase();

  const result = await pool.query(
    `DELETE FROM topics t USING course_modules m, courses c
     WHERE t.id = $1 AND m.id = t.module_id AND c.id = m.course_id
       AND c.owner = $2
     RETURNING t.title`,
    [id, owner]
  );

  return result.rows[0]?.title ?? null;
}
