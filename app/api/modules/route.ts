import { NextResponse } from "next/server";
import { handle, parseId, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { createModule, getModule, listModules } from "@/lib/modules";
import { parseModule } from "@/lib/validate";

export const GET = handle(async (request: Request) => {
  const project = new URL(request.url).searchParams.get("project");

  return NextResponse.json(
    await listModules(project ? parseId(project) : undefined)
  );
});

export const POST = handle(async (request: Request) => {
  const input = parseModule(await readJson(request));
  const id = await createModule(input);

  await logActivity("created", "module", input.name);

  return NextResponse.json(await getModule(id), { status: 201 });
});
