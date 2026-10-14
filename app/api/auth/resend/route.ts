import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/api";
import { resendCode } from "@/lib/cognito";
import { email } from "../fields";

export const POST = handle(async (request: Request) => {
  await resendCode(email((await readJson(request)).email));

  return NextResponse.json({ sent: true });
});
