import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ACCESS_COOKIE_NAME,
  ACTIVE_TENANT_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  applyAuthCookies,
  clearAuthCookies,
} from "@/lib/auth/cookies";
import { isRefreshExpired, refreshSessionWithToken } from "@/lib/auth/refresh";

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value ?? null;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value ?? null;
  const activeTenantId =
    request.cookies.get(ACTIVE_TENANT_COOKIE_NAME)?.value ?? null;
  const { pathname } = request.nextUrl;
  const isProtectedRoute =
    pathname.startsWith("/tasks") ||
    pathname.startsWith("/exports") ||
    pathname.startsWith("/projects");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  if (!accessToken && refreshToken && (isProtectedRoute || isAuthRoute)) {
    try {
      const auth = await refreshSessionWithToken(refreshToken, activeTenantId);
      const response = isAuthRoute
        ? NextResponse.redirect(new URL("/", request.url))
        : NextResponse.next();
      applyAuthCookies(response, auth);
      return response;
    } catch (error) {
      if (isRefreshExpired(error)) {
        const response = isProtectedRoute
          ? NextResponse.redirect(new URL("/login", request.url))
          : NextResponse.next();
        clearAuthCookies(response);
        return response;
      }
    }
  }

  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/tasks/:path*",
    "/exports/:path*",
    "/projects/:path*",
  ],
};
