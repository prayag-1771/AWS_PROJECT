import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_SECONDS } from "@/lib/auth";

// The site is served over HTTP today, so the cookie is only marked Secure
// when the request arrived over HTTPS.
function secure(request: Request) {
  return request.headers.get("x-forwarded-proto") === "https";
}

export function withSession(request: Request, token: string) {
  const response = NextResponse.json({ signedIn: true });

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secure(request),
    path: "/",
    maxAge: SESSION_SECONDS,
  });

  return response;
}

export function withoutSession(request: Request) {
  const response = NextResponse.json({ signedOut: true });

  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: secure(request),
    path: "/",
    maxAge: 0,
  });

  return response;
}
