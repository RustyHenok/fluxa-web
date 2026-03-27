import { NextResponse } from "next/server";

import { FluxaApiError, fluxaApi } from "@/lib/api/client";
import type { SwitchTenantRequest } from "@/lib/api/types";
import { applyAuthCookies, readServerSession } from "@/lib/auth/session";

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
  const session = await readServerSession();

  if (!session.accessToken) {
    return NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "You need to sign in before switching tenants.",
        },
      },
      { status: 401 },
    );
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
    return errorResponse(error);
  }
}
