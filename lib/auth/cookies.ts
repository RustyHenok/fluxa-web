import { NextResponse } from "next/server";

import type { AuthResponse } from "@/lib/api/types";

export const ACCESS_COOKIE_NAME = "fluxa_access_token";
export const REFRESH_COOKIE_NAME = "fluxa_refresh_token";
export const ACTIVE_TENANT_COOKIE_NAME = "fluxa_active_tenant_id";

export const REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    ...(typeof maxAge === "number" ? { maxAge } : {}),
  };
}

export function applyAuthCookies(response: NextResponse, auth: AuthResponse) {
  response.cookies.set(
    ACCESS_COOKIE_NAME,
    auth.access_token,
    cookieOptions(auth.expires_in_seconds),
  );
  response.cookies.set(
    REFRESH_COOKIE_NAME,
    auth.refresh_token,
    cookieOptions(REFRESH_COOKIE_MAX_AGE_SECONDS),
  );
  response.cookies.set(
    ACTIVE_TENANT_COOKIE_NAME,
    auth.active_tenant.tenant_id,
    cookieOptions(REFRESH_COOKIE_MAX_AGE_SECONDS),
  );
}

export function clearAuthCookies(response: NextResponse) {
  const expiredCookie = {
    ...cookieOptions(0),
    expires: new Date(0),
  };

  response.cookies.set(ACCESS_COOKIE_NAME, "", expiredCookie);
  response.cookies.set(REFRESH_COOKIE_NAME, "", expiredCookie);
  response.cookies.set(ACTIVE_TENANT_COOKIE_NAME, "", expiredCookie);
}
