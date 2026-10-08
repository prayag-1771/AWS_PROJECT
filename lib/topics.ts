import pool from "./db";
import { missingParent } from "./api";
import { ensureDatabase } from "./init-db";
import type { TopicInput } from "./validate";

export type Topic = {
  id: number;
  module_id: number;
  title: string;
  done: boolean;
};

export async function listTopics(moduleId: number): Promise<Topic[]> {
  await ensureDatabase();

  const result = await pool.query(
    "SELECT id, module_id, title, done FROM topics WHERE module_id = $1 ORDER BY id",
    [moduleId]
  );

  return result.rows;
}

export async function createTopic(input: TopicInput): Promise<Topic> {
  await ensureDatabase();

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
  id: number,
  done: boolean
): Promise<Topic | null> {
  await ensureDatabase();

  const result = await pool.query(
    `UPDATE topics SET done = $1 WHERE id = $2
     RETURNING id, module_id, title, done`,
    [done, id]
  );

  return result.rows[0] || null;
}

export async function deleteTopic(id: number): Promise<string | null> {
  await ensureDatabase();

  const result = await pool.query(
    "DELETE FROM topics WHERE id = $1 RETURNING title",
    [id]
  );

  return result.rows[0]?.title ?? null;
}
