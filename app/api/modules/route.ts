import { NextResponse } from "next/server";
import { handle, parseId, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { createModule, getModule, listModules } from "@/lib/modules";
import { parseModule } from "@/lib/validate";

export const GET = handle(async (request: Request) => {
  const course = new URL(request.url).searchParams.get("course");

  return NextResponse.json(
    await listModules(course ? parseId(course) : undefined)
  );
});

export const POST = handle(async (request: Request) => {
  const input = parseModule(await readJson(request));
  const id = await createModule(input);

  await logActivity("added", "module", input.name);

  return NextResponse.json(await getModule(id), { status: 201 });
});
