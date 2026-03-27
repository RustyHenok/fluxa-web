import { NextResponse } from "next/server";

import { FluxaApiError, fluxaRequest } from "@/lib/api/client";
import { clearAuthCookies, readServerSession } from "@/lib/auth/session";

export async function POST() {
  const session = await readServerSession();
  const response = new NextResponse(null, { status: 204 });

  try {
    if (session.refreshToken) {
      await fluxaRequest<unknown>("/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: session.refreshToken }),
      });
    }
  } catch (error) {
    if (!(error instanceof FluxaApiError)) {
      return NextResponse.json(
        {
          error: {
            code: "internal_error",
            message: "Unable to end the session right now.",
          },
        },
        { status: 500 },
      );
    }
  }

  clearAuthCookies(response);
  return response;
}
