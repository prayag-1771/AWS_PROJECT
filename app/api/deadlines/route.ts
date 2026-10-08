import { NextResponse } from "next/server";
import { handle, parseId, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { createDeadline, getDeadline, listDeadlines } from "@/lib/deadlines";
import { parseDeadline } from "@/lib/validate";

export const GET = handle(async (request: Request) => {
  const course = new URL(request.url).searchParams.get("course");

  return NextResponse.json(
    await listDeadlines(course ? parseId(course) : undefined)
  );
});

export const POST = handle(async (request: Request) => {
  const input = parseDeadline(await readJson(request));
  const id = await createDeadline(input);

  await logActivity("added", "deadline", input.title);

  return NextResponse.json(await getDeadline(id), { status: 201 });
});
