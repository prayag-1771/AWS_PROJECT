import { NextResponse } from "next/server";
import { ApiError, handle, parseId, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { deleteModule, getModule, updateModule } from "@/lib/modules";
import { parseModule } from "@/lib/validate";

type Context = { params: Promise<{ id: string }> };

export const GET = handle(async (_request: Request, { params }: Context) => {
  const found = await getModule(parseId((await params).id));

  if (!found) {
    throw new ApiError("Module not found", 404);
  }

  return NextResponse.json(found);
});

// Accepts a partial body: fields that are left out keep their current value.
export const PATCH = handle(async (request: Request, { params }: Context) => {
  const id = parseId((await params).id);
  const existing = await getModule(id);

  if (!existing) {
    throw new ApiError("Module not found", 404);
  }

  const input = parseModule({ ...existing, ...(await readJson(request)) });

  await updateModule(id, input);
  await logActivity("updated", "module", input.name);

  return NextResponse.json(await getModule(id));
});

export const DELETE = handle(async (_request: Request, { params }: Context) => {
  const deleted = await deleteModule(parseId((await params).id));

  if (!deleted) {
    throw new ApiError("Module not found", 404);
  }

  await logActivity("deleted", "module", deleted.name);

  return NextResponse.json({ deleted: true });
});
