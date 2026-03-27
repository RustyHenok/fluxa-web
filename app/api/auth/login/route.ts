import { NextResponse } from "next/server";

import { FluxaApiError, fluxaApi } from "@/lib/api/client";
import type { LoginRequest } from "@/lib/api/types";
import { applyAuthCookies } from "@/lib/auth/cookies";

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
        message: "Unable to complete the login flow right now.",
      },
    },
    { status: 500 },
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginRequest;
    const auth = await fluxaApi.login(body);

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
