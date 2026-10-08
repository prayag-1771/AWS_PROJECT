import pool from "./db";
import { ensureDatabase } from "./init-db";

export type Activity = {
  id: number;
  action: string;
  entity: string;
  entity_name: string;
  created_at: Date | string;
};

// Activity is a convenience feed, so a failure to record it must never
// fail the request that triggered it.
export async function logActivity(
  action: string,
  entity: string,
  entityName: string
) {
  try {
    await pool.query(
      "INSERT INTO activity (action, entity, entity_name) VALUES ($1, $2, $3)",
      [action, entity, entityName.slice(0, 200)]
    );
  } catch (error) {
    console.error(error);
  }
}

export async function listActivity(limit = 8): Promise<Activity[]> {
  await ensureDatabase();

  const result = await pool.query(
    "SELECT * FROM activity ORDER BY created_at DESC, id DESC LIMIT $1",
    [limit]
  );

  return result.rows;
}
