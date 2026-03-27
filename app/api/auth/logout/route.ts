import { NextResponse } from "next/server";

import { fluxaApi } from "@/lib/api/client";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { readServerSession } from "@/lib/auth/session";

export async function POST() {
  const session = await readServerSession();
  const response = new NextResponse(null, { status: 204 });

  try {
    if (session.refreshToken) {
      await fluxaApi.logout({
        refresh_token: session.refreshToken,
      });
    }
  } catch {
    // Backend token revocation is best-effort here. The browser session should
    // still be terminated even if the upstream logout request fails.
  }

  clearAuthCookies(response);
  return response;
}
