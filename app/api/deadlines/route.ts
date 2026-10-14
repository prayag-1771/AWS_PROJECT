import { NextResponse } from "next/server";
import { handle, parseId, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { apiUser } from "@/lib/auth";
import { createDeadline, getDeadline, listDeadlines } from "@/lib/deadlines";
import { parseDeadline } from "@/lib/validate";

export const GET = handle(async (request: Request) => {
  const user = await apiUser();
  const course = new URL(request.url).searchParams.get("course");

  return NextResponse.json(
    await listDeadlines(user.sub, course ? parseId(course) : undefined)
  );
});

export const POST = handle(async (request: Request) => {
  const user = await apiUser();
  const input = parseDeadline(await readJson(request));
  const id = await createDeadline(user.sub, input);

  await logActivity(user.sub, "added", "deadline", input.title);

  return NextResponse.json(await getDeadline(user.sub, id), { status: 201 });
});
