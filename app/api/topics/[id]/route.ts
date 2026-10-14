import { NextResponse } from "next/server";
import { ApiError, handle, parseId, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { apiUser } from "@/lib/auth";
import { deleteTopic, setTopicDone } from "@/lib/topics";
import { flag } from "@/lib/validate";

type Context = { params: Promise<{ id: string }> };

export const PATCH = handle(async (request: Request, { params }: Context) => {
  const user = await apiUser();
  const id = parseId((await params).id);
  const done = flag((await readJson(request)).done, "Done");
  const topic = await setTopicDone(user.sub, id, done);

  if (!topic) {
    throw new ApiError("Topic not found", 404);
  }

  if (done) {
    await logActivity(user.sub, "completed", "topic", topic.title);
  }

  return NextResponse.json(topic);
});

export const DELETE = handle(async (_request: Request, { params }: Context) => {
  const user = await apiUser();
  const title = await deleteTopic(user.sub, parseId((await params).id));

  if (title === null) {
    throw new ApiError("Topic not found", 404);
  }

  await logActivity(user.sub, "deleted", "topic", title);

  return NextResponse.json({ deleted: true });
});
