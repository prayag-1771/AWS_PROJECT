import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { getSettings, saveSettings } from "@/lib/settings";

export const GET = handle(async () => {
  return NextResponse.json(await getSettings());
});

export const PUT = handle(async (request: Request) => {
  const settings = await saveSettings(await readJson(request));

  await logActivity("updated", "settings", "Platform settings");

  return NextResponse.json(settings);
});
