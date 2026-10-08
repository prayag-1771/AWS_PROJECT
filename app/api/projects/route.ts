import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { createProject, listProjects } from "@/lib/projects";
import { parseProject } from "@/lib/validate";

export const GET = handle(async () => {
  return NextResponse.json(await listProjects());
});

export const POST = handle(async (request: Request) => {
  const input = parseProject(await readJson(request));
  const project = await createProject(input);

  await logActivity("created", "project", project.name);

  return NextResponse.json(project, { status: 201 });
});
