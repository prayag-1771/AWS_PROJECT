import { NextResponse } from "next/server";
import { ApiError, handle, parseId, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { deleteProject, getProject, updateProject } from "@/lib/projects";
import { parseProject } from "@/lib/validate";

type Context = { params: Promise<{ id: string }> };

export const GET = handle(async (_request: Request, { params }: Context) => {
  const project = await getProject(parseId((await params).id));

  if (!project) {
    throw new ApiError("Project not found", 404);
  }

  return NextResponse.json(project);
});

// Accepts a partial body: fields that are left out keep their current value.
export const PATCH = handle(async (request: Request, { params }: Context) => {
  const id = parseId((await params).id);
  const existing = await getProject(id);

  if (!existing) {
    throw new ApiError("Project not found", 404);
  }

  const input = parseProject({ ...existing, ...(await readJson(request)) });

  await updateProject(id, input);
  await logActivity("updated", "project", input.name);

  return NextResponse.json(await getProject(id));
});

export const DELETE = handle(async (_request: Request, { params }: Context) => {
  const project = await deleteProject(parseId((await params).id));

  if (!project) {
    throw new ApiError("Project not found", 404);
  }

  await logActivity("deleted", "project", project.name);

  return NextResponse.json({ deleted: true });
});
