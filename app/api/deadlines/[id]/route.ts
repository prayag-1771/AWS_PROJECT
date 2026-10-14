import { NextResponse } from "next/server";
import { ApiError, handle, parseId, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { apiUser } from "@/lib/auth";
import { deleteDeadline, getDeadline, updateDeadline } from "@/lib/deadlines";
import { parseDeadline } from "@/lib/validate";

type Context = { params: Promise<{ id: string }> };

export const GET = handle(async (_request: Request, { params }: Context) => {
  const user = await apiUser();
  const found = await getDeadline(user.sub, parseId((await params).id));

  if (!found) {
    throw new ApiError("Deadline not found", 404);
  }

  return NextResponse.json(found);
});

// Accepts a partial body: fields that are left out keep their current value.
export const PATCH = handle(async (request: Request, { params }: Context) => {
  const user = await apiUser();
  const id = parseId((await params).id);
  const existing = await getDeadline(user.sub, id);

  if (!existing) {
    throw new ApiError("Deadline not found", 404);
  }

  const input = parseDeadline({ ...existing, ...(await readJson(request)) });

  await updateDeadline(user.sub, id, input);
  await logActivity(user.sub, "updated", "deadline", input.title);

  return NextResponse.json(await getDeadline(user.sub, id));
});

export const DELETE = handle(async (_request: Request, { params }: Context) => {
  const user = await apiUser();
  const name = await deleteDeadline(user.sub, parseId((await params).id));

  if (name === null) {
    throw new ApiError("Deadline not found", 404);
  }

  await logActivity(user.sub, "deleted", "deadline", name);

  return NextResponse.json({ deleted: true });
});
