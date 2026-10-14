import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/api";
import { signUp } from "@/lib/cognito";
import { email, password, required } from "../fields";

export const POST = handle(async (request: Request) => {
  const body = await readJson(request);
  const result = await signUp(
    required(body.name, "Name", 100),
    email(body.email),
    password(body.password)
  );

  return NextResponse.json(result, { status: 201 });
});
