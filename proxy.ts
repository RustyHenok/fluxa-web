import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ACCESS_COOKIE_NAME } from "@/lib/auth/cookies";

export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(ACCESS_COOKIE_NAME)?.value);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/tasks") && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/register") && hasSession) {
    return NextResponse.redirect(new URL("/tasks", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/tasks/:path*", "/exports/:path*"],
};
