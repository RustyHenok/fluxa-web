import { NextResponse } from "next/server";

import { FluxaApiError, fluxaApi } from "@/lib/api/client";
import type { SwitchTenantRequest } from "@/lib/api/types";
import { applyAuthCookies } from "@/lib/auth/cookies";
import { applyResolvedSession, resolveServerSession } from "@/lib/auth/session";

function errorResponse(error: unknown) {
  if (error instanceof FluxaApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.status },
    );
  }

  return NextResponse.json(
    {
      error: {
        code: "internal_error",
        message: "Unable to switch tenant right now.",
      },
    },
    { status: 500 },
  );
}

export async function POST(request: Request) {
  const session = await resolveServerSession();

  if (!session.accessToken) {
    const response = NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "You need to sign in before switching tenants.",
        },
      },
      { status: 401 },
    );
    applyResolvedSession(response, session);
    return response;
  }

  try {
    const body = (await request.json()) as SwitchTenantRequest;
    const auth = await fluxaApi.switchTenant(session.accessToken, body.tenant_id);

    const response = NextResponse.json({
      user: auth.user,
      active_tenant: auth.active_tenant,
      expires_in_seconds: auth.expires_in_seconds,
    });

    applyAuthCookies(response, auth);

    return response;
  } catch (error) {
    const response = errorResponse(error);
    applyResolvedSession(response, session);
    return response;
  }
}
