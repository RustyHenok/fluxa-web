import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { AuthResponse } from "@/lib/api/types";

import {
  ACCESS_COOKIE_NAME,
  ACTIVE_TENANT_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE_NAME,
} from "./cookies";

function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    ...(maxAge ? { maxAge } : {}),
  };
}

export async function readServerSession() {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(ACCESS_COOKIE_NAME)?.value ?? null,
    refreshToken: cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null,
    activeTenantId: cookieStore.get(ACTIVE_TENANT_COOKIE_NAME)?.value ?? null,
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
  response.cookies.set(ACCESS_COOKIE_NAME, "", cookieOptions(0));
  response.cookies.set(REFRESH_COOKIE_NAME, "", cookieOptions(0));
  response.cookies.set(ACTIVE_TENANT_COOKIE_NAME, "", cookieOptions(0));
}
