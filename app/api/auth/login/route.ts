import { handle, readJson } from "@/lib/api";
import { signIn } from "@/lib/cognito";
import { email, password } from "../fields";
import { withSession } from "../session";

export const POST = handle(async (request: Request) => {
  const body = await readJson(request);
  const token = await signIn(email(body.email), password(body.password));

  return withSession(request, token);
});
