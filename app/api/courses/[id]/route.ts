import { NextResponse } from "next/server";
import { ApiError, handle, parseId, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { deleteCourse, getCourse, updateCourse } from "@/lib/courses";
import { parseCourse } from "@/lib/validate";

type Context = { params: Promise<{ id: string }> };

export const GET = handle(async (_request: Request, { params }: Context) => {
  const course = await getCourse(parseId((await params).id));

  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  return NextResponse.json(course);
});

// Accepts a partial body: fields that are left out keep their current value.
export const PATCH = handle(async (request: Request, { params }: Context) => {
  const id = parseId((await params).id);
  const existing = await getCourse(id);

  if (!existing) {
    throw new ApiError("Course not found", 404);
  }

  const input = parseCourse({ ...existing, ...(await readJson(request)) });

  await updateCourse(id, input);
  await logActivity("updated", "course", input.name);

  return NextResponse.json(await getCourse(id));
});

export const DELETE = handle(async (_request: Request, { params }: Context) => {
  const name = await deleteCourse(parseId((await params).id));

  if (name === null) {
    throw new ApiError("Course not found", 404);
  }

  await logActivity("deleted", "course", name);

  return NextResponse.json({ deleted: true });
});
