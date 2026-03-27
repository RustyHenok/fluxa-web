import { NextResponse } from "next/server";

import { fluxaApi } from "@/lib/api/client";
import { apiErrorResponse } from "@/lib/api/errors";
import { readServerSession } from "@/lib/auth/session";

interface RouteContext {
  params: Promise<{
    jobId: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await readServerSession();

  if (!session.accessToken) {
    return NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "You need to sign in before viewing job results.",
        },
      },
      { status: 401 },
    );
  }

  try {
    const { jobId } = await context.params;
    const result = await fluxaApi.getJobResult(session.accessToken, jobId);
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error, "Unable to load the job result right now.");
  }
}
