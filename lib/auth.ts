import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { ApiError } from "./api";

export const SESSION_COOKIE = "cnh_session";

// Twelve hours, the lifetime of the Cognito ID token.
export const SESSION_SECONDS = 12 * 60 * 60;

export type User = {
  sub: string;
  email: string;
  name: string;
};

function createVerifier() {
  return CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID || "",
    clientId: process.env.COGNITO_CLIENT_ID || "",
    tokenUse: "id",
  });
}

let verifier: ReturnType<typeof createVerifier> | undefined;

// The session cookie holds the Cognito ID token; its signature is checked
// against the user pool's public keys on every request.
export async function getUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token || !process.env.COGNITO_USER_POOL_ID) {
    return null;
  }

  try {
    verifier ??= createVerifier();

    const payload = await verifier.verify(token);
    const email = String(payload.email ?? "");

    return { sub: payload.sub, email, name: String(payload.name ?? email) };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function apiUser() {
  const user = await getUser();

  if (!user) {
    throw new ApiError("Please sign in", 401);
  }

  return user;
}
