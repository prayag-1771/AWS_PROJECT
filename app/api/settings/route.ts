import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { apiUser } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/settings";

export const GET = handle(async () => {
  const user = await apiUser();

  return NextResponse.json(await getSettings(user.sub));
});

export const PUT = handle(async (request: Request) => {
  const user = await apiUser();
  const settings = await saveSettings(user.sub, await readJson(request));

  await logActivity(user.sub, "updated", "settings", "Planner settings");

  return NextResponse.json(settings);
});
