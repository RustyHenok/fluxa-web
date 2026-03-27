import { NextResponse } from "next/server";

import { fluxaApi } from "@/lib/api/client";
import { apiErrorResponse } from "@/lib/api/errors";
import { applyResolvedSession, resolveServerSession } from "@/lib/auth/session";

interface RouteContext {
  params: Promise<{
    jobId: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await resolveServerSession();

  if (!session.accessToken) {
    const response = NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "You need to sign in before viewing job results.",
        },
      },
      { status: 401 },
    );
    applyResolvedSession(response, session);
    return response;
  }

  try {
    const { jobId } = await context.params;
    const result = await fluxaApi.getJobResult(session.accessToken, jobId);
    const response = NextResponse.json(result);
    applyResolvedSession(response, session);
    return response;
  } catch (error) {
    const response = apiErrorResponse(error, "Unable to load the job result right now.");
    applyResolvedSession(response, session);
    return response;
  }
}
