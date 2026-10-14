import { NextResponse } from "next/server";
import { ApiError, handle, parseId, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { apiUser } from "@/lib/auth";
import { deleteModule, getModule, updateModule } from "@/lib/modules";
import { parseModule } from "@/lib/validate";

type Context = { params: Promise<{ id: string }> };

export const GET = handle(async (_request: Request, { params }: Context) => {
  const user = await apiUser();
  const found = await getModule(user.sub, parseId((await params).id));

  if (!found) {
    throw new ApiError("Module not found", 404);
  }

  return NextResponse.json(found);
});

// Accepts a partial body: fields that are left out keep their current value.
export const PATCH = handle(async (request: Request, { params }: Context) => {
  const user = await apiUser();
  const id = parseId((await params).id);
  const existing = await getModule(user.sub, id);

  if (!existing) {
    throw new ApiError("Module not found", 404);
  }

  const input = parseModule({ ...existing, ...(await readJson(request)) });

  await updateModule(user.sub, id, input);
  await logActivity(user.sub, "updated", "module", input.name);

  return NextResponse.json(await getModule(user.sub, id));
});

export const DELETE = handle(async (_request: Request, { params }: Context) => {
  const user = await apiUser();
  const name = await deleteModule(user.sub, parseId((await params).id));

  if (name === null) {
    throw new ApiError("Module not found", 404);
  }

  await logActivity(user.sub, "deleted", "module", name);

  return NextResponse.json({ deleted: true });
});
