import { NextResponse } from "next/server";
import { ApiError, handle, parseId, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { apiUser } from "@/lib/auth";
import { deleteCourse, getCourse, updateCourse } from "@/lib/courses";
import { parseCourse } from "@/lib/validate";

type Context = { params: Promise<{ id: string }> };

export const GET = handle(async (_request: Request, { params }: Context) => {
  const user = await apiUser();
  const found = await getCourse(user.sub, parseId((await params).id));

  if (!found) {
    throw new ApiError("Course not found", 404);
  }

  return NextResponse.json(found);
});

// Accepts a partial body: fields that are left out keep their current value.
export const PATCH = handle(async (request: Request, { params }: Context) => {
  const user = await apiUser();
  const id = parseId((await params).id);
  const existing = await getCourse(user.sub, id);

  if (!existing) {
    throw new ApiError("Course not found", 404);
  }

  const input = parseCourse({ ...existing, ...(await readJson(request)) });

  await updateCourse(user.sub, id, input);
  await logActivity(user.sub, "updated", "course", input.name);

  return NextResponse.json(await getCourse(user.sub, id));
});

export const DELETE = handle(async (_request: Request, { params }: Context) => {
  const user = await apiUser();
  const name = await deleteCourse(user.sub, parseId((await params).id));

  if (name === null) {
    throw new ApiError("Course not found", 404);
  }

  await logActivity(user.sub, "deleted", "course", name);

  return NextResponse.json({ deleted: true });
});
