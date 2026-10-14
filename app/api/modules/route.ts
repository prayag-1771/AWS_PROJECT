import { NextResponse } from "next/server";
import { handle, parseId, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { apiUser } from "@/lib/auth";
import { createModule, getModule, listModules } from "@/lib/modules";
import { parseModule } from "@/lib/validate";

export const GET = handle(async (request: Request) => {
  const user = await apiUser();
  const course = new URL(request.url).searchParams.get("course");

  return NextResponse.json(
    await listModules(user.sub, course ? parseId(course) : undefined)
  );
});

export const POST = handle(async (request: Request) => {
  const user = await apiUser();
  const input = parseModule(await readJson(request));
  const id = await createModule(user.sub, input);

  await logActivity(user.sub, "added", "module", input.name);

  return NextResponse.json(await getModule(user.sub, id), { status: 201 });
});
