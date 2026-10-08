import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { createCourse, getCourse, listCourses } from "@/lib/courses";
import { parseCourse } from "@/lib/validate";

export const GET = handle(async () => {
  return NextResponse.json(await listCourses());
});

export const POST = handle(async (request: Request) => {
  const input = parseCourse(await readJson(request));
  const id = await createCourse(input);

  await logActivity("added", "course", input.name);

  return NextResponse.json(await getCourse(id), { status: 201 });
});
