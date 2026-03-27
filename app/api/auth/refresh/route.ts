import { NextResponse } from "next/server";

import { apiErrorResponse } from "@/lib/api/errors";
import { applyResolvedSession, readServerSession } from "@/lib/auth/session";
import { refreshSessionWithToken } from "@/lib/auth/refresh";

export async function POST() {
  const session = await readServerSession();

  if (!session.refreshToken) {
    return NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "No refresh token is available for this session.",
        },
      },
      { status: 401 },
    );
  }

  try {
    const auth = await refreshSessionWithToken(
      session.refreshToken,
      session.activeTenantId,
    );

    const response = NextResponse.json({
      expires_in_seconds: auth.expires_in_seconds,
      active_tenant: auth.active_tenant,
      user: auth.user,
    });

    applyResolvedSession(response, {
      accessToken: auth.access_token,
      refreshToken: auth.refresh_token,
      activeTenantId: auth.active_tenant.tenant_id,
      refreshedAuth: auth,
      shouldClearCookies: false,
    });

    return response;
  } catch (error) {
    const response = apiErrorResponse(error, "Unable to refresh the session right now.");
    applyResolvedSession(response, {
      accessToken: null,
      refreshToken: session.refreshToken,
      activeTenantId: session.activeTenantId,
      refreshedAuth: null,
      shouldClearCookies: true,
    });
    return response;
  }
}
