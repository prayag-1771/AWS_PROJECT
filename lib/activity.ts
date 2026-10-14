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
  owner: string,
  action: string,
  entity: string,
  entityName: string
) {
  try {
    await ensureDatabase();
    await pool.query(
      `INSERT INTO activity (owner, action, entity, entity_name)
       VALUES ($1, $2, $3, $4)`,
      [owner, action, entity, entityName.slice(0, 200)]
    );
  } catch (error) {
    console.error(error);
  }
}

export async function listActivity(
  owner: string,
  limit = 8
): Promise<Activity[]> {
  await ensureDatabase();

  const result = await pool.query(
    `SELECT id, action, entity, entity_name, created_at FROM activity
     WHERE owner = $1 ORDER BY created_at DESC, id DESC LIMIT $2`,
    [owner, limit]
  );

  return result.rows;
}
