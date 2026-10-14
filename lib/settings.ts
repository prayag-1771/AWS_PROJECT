import pool from "./db";
import { ApiError } from "./api";
import { ensureDatabase } from "./init-db";
import { SEMESTERS } from "./options";

export const SETTING_OPTIONS = {
  default_semester: SEMESTERS,
  default_credits: ["1", "2", "3", "4", "5"],
  deadline_window: ["3 days", "7 days", "14 days"],
};

export type Settings = Record<keyof typeof SETTING_OPTIONS, string>;

const KEYS = Object.keys(SETTING_OPTIONS) as (keyof Settings)[];

export const DEFAULT_SETTINGS: Settings = {
  default_semester: "Fall Semester",
  default_credits: "3",
  deadline_window: "7 days",
};

// Each student's settings are stored under keys prefixed with their user ID.
function fullKey(owner: string, key: string) {
  return `${owner}:${key}`;
}

export async function getSettings(owner: string): Promise<Settings> {
  await ensureDatabase();

  const result = await pool.query(
    "SELECT key, value FROM settings WHERE key = ANY($1)",
    [KEYS.map((key) => fullKey(owner, key))]
  );
  const settings = { ...DEFAULT_SETTINGS };

  for (const row of result.rows) {
    const key = row.key.slice(owner.length + 1) as keyof Settings;

    if (KEYS.includes(key)) {
      settings[key] = row.value;
    }
  }

  return settings;
}

export async function saveSettings(
  owner: string,
  body: Record<string, unknown>
) {
  await ensureDatabase();

  for (const key of KEYS) {
    const value = body[key];

    if (typeof value !== "string" || !SETTING_OPTIONS[key].includes(value)) {
      throw new ApiError(`${key.replace(/_/g, " ")} is not a valid option`);
    }
  }

  for (const key of KEYS) {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [fullKey(owner, key), body[key]]
    );
  }

  return getSettings(owner);
}
