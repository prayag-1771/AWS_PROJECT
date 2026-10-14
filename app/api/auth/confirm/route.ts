import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/api";
import { confirmSignUp } from "@/lib/cognito";
import { email, required } from "../fields";

export const POST = handle(async (request: Request) => {
  const body = await readJson(request);

  await confirmSignUp(email(body.email), required(body.code, "Code", 20));

  return NextResponse.json({ confirmed: true });
});
