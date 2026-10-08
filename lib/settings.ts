import pool from "./db";
import { ApiError } from "./api";
import { ensureDatabase } from "./init-db";
import { ENVIRONMENTS, REGIONS } from "./options";

export const SETTING_OPTIONS = {
  default_region: REGIONS,
  default_environment: ENVIRONMENTS,
  deployment_strategy: ["Rolling Deployment", "Blue / Green", "Canary"],
  monitoring: ["Enabled", "Disabled"],
  notifications: ["All events", "Important events only", "Disabled"],
};

export type Settings = Record<keyof typeof SETTING_OPTIONS, string>;

const KEYS = Object.keys(SETTING_OPTIONS) as (keyof Settings)[];

export const DEFAULT_SETTINGS: Settings = {
  default_region: "Asia Pacific (Mumbai)",
  default_environment: "Development",
  deployment_strategy: "Rolling Deployment",
  monitoring: "Enabled",
  notifications: "Important events only",
};

export async function getSettings(): Promise<Settings> {
  await ensureDatabase();

  const result = await pool.query("SELECT key, value FROM settings");
  const settings = { ...DEFAULT_SETTINGS };

  for (const row of result.rows) {
    if (KEYS.includes(row.key)) {
      settings[row.key as keyof Settings] = row.value;
    }
  }

  return settings;
}

export async function saveSettings(body: Record<string, unknown>) {
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
      [key, body[key]]
    );
  }

  return getSettings();
}
