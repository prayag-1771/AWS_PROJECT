import { NextResponse } from "next/server";
import { ApiError, handle, parseId, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { deleteDeadline, getDeadline, updateDeadline } from "@/lib/deadlines";
import { parseDeadline } from "@/lib/validate";

type Context = { params: Promise<{ id: string }> };

export const GET = handle(async (_request: Request, { params }: Context) => {
  const found = await getDeadline(parseId((await params).id));

  if (!found) {
    throw new ApiError("Deadline not found", 404);
  }

  return NextResponse.json(found);
});

// Accepts a partial body: fields that are left out keep their current value.
export const PATCH = handle(async (request: Request, { params }: Context) => {
  const id = parseId((await params).id);
  const existing = await getDeadline(id);

  if (!existing) {
    throw new ApiError("Deadline not found", 404);
  }

  const input = parseDeadline({ ...existing, ...(await readJson(request)) });

  await updateDeadline(id, input);
  await logActivity("updated", "deadline", input.title);

  return NextResponse.json(await getDeadline(id));
});

export const DELETE = handle(async (_request: Request, { params }: Context) => {
  const name = await deleteDeadline(parseId((await params).id));

  if (name === null) {
    throw new ApiError("Deadline not found", 404);
  }

  await logActivity("deleted", "deadline", name);

  return NextResponse.json({ deleted: true });
});
