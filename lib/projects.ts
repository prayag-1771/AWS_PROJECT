import pool from "./db";
import { ensureDatabase } from "./init-db";

export type Project = {
  id: number;
  name: string;
  environment: string;
  architecture: string;
  region: string;
  status: string;
  created_at: string;
};

export async function listProjects(): Promise<Project[]> {
  await ensureDatabase();

  const result = await pool.query(
    "SELECT * FROM projects ORDER BY created_at DESC"
  );

  return result.rows;
}
