import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pages and APIs that work without signing in.
const PUBLIC = ["/login", "/api/auth", "/api/health", "/api/status"];

// Behind the load balancer, the public address comes from the forwarded headers.
function origin(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "http";

  return host ? `${protocol}://${host}` : request.nextUrl.origin;
}

// A quick check that a session cookie exists; each page and API route
// verifies the token itself before using it.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  if (request.cookies.has("cnh_session")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  }

  const url = new URL("/login", origin(request));

  if (pathname !== "/") {
    url.searchParams.set("next", pathname);
  }

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|architecture.svg).*)"],
};
