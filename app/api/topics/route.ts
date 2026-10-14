import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { apiUser } from "@/lib/auth";
import { createTopic } from "@/lib/topics";
import { parseTopic } from "@/lib/validate";

export const POST = handle(async (request: Request) => {
  const user = await apiUser();
  const topic = await createTopic(user.sub, parseTopic(await readJson(request)));

  await logActivity(user.sub, "added", "topic", topic.title);

  return NextResponse.json(topic, { status: 201 });
});
