import { cookies } from "next/headers";
import type { AuthResponse } from "@/lib/api/types";

import {
  ACCESS_COOKIE_NAME,
  ACTIVE_TENANT_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  applyAuthCookies,
  clearAuthCookies,
} from "./cookies";
import { isRefreshExpired, refreshSessionWithToken } from "./refresh";

export interface ServerSession {
  accessToken: string | null;
  refreshToken: string | null;
  activeTenantId: string | null;
}

export interface ResolvedServerSession extends ServerSession {
  refreshedAuth: AuthResponse | null;
  shouldClearCookies: boolean;
}

export async function readServerSession() {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(ACCESS_COOKIE_NAME)?.value ?? null,
    refreshToken: cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null,
    activeTenantId: cookieStore.get(ACTIVE_TENANT_COOKIE_NAME)?.value ?? null,
  };
}

export async function resolveServerSession(): Promise<ResolvedServerSession> {
  const session = await readServerSession();

  if (session.accessToken) {
    return {
      ...session,
      refreshedAuth: null,
      shouldClearCookies: false,
    };
  }

  if (!session.refreshToken) {
    return {
      ...session,
      refreshedAuth: null,
      shouldClearCookies: false,
    };
  }

  try {
    const auth = await refreshSessionWithToken(
      session.refreshToken,
      session.activeTenantId,
    );

    return {
      accessToken: auth.access_token,
      refreshToken: auth.refresh_token,
      activeTenantId: auth.active_tenant.tenant_id,
      refreshedAuth: auth,
      shouldClearCookies: false,
    };
  } catch (error) {
    return {
      accessToken: null,
      refreshToken: session.refreshToken,
      activeTenantId: session.activeTenantId,
      refreshedAuth: null,
      shouldClearCookies: isRefreshExpired(error),
    };
  }
}

export function applyResolvedSession(
  response: import("next/server").NextResponse,
  session: ResolvedServerSession,
) {
  if (session.refreshedAuth) {
    applyAuthCookies(response, session.refreshedAuth);
  }

  if (session.shouldClearCookies) {
    clearAuthCookies(response);
  }
}
