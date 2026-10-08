import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { createTopic } from "@/lib/topics";
import { parseTopic } from "@/lib/validate";

export const POST = handle(async (request: Request) => {
  const topic = await createTopic(parseTopic(await readJson(request)));

  await logActivity("added", "topic", topic.title);

  return NextResponse.json(topic, { status: 201 });
});
