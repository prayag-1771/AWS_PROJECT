import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { apiUser } from "@/lib/auth";
import { createCourse, getCourse, listCourses } from "@/lib/courses";
import { parseCourse } from "@/lib/validate";

export const GET = handle(async () => {
  const user = await apiUser();

  return NextResponse.json(await listCourses(user.sub));
});

export const POST = handle(async (request: Request) => {
  const user = await apiUser();
  const input = parseCourse(await readJson(request));
  const id = await createCourse(user.sub, input);

  await logActivity(user.sub, "added", "course", input.name);

  return NextResponse.json(await getCourse(user.sub, id), { status: 201 });
});
