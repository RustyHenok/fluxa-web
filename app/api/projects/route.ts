import { NextResponse } from "next/server";

import { fluxaApi } from "@/lib/api/client";
import { apiErrorResponse } from "@/lib/api/errors";
import type { ProjectPayload } from "@/lib/api/types";
import { applyResolvedSession, resolveServerSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const session = await resolveServerSession();

  if (!session.accessToken) {
    const response = NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "You need to sign in before creating a project.",
        },
      },
      { status: 401 },
    );
    applyResolvedSession(response, session);
    return response;
  }

  try {
    const body = (await request.json()) as ProjectPayload;
    const project = await fluxaApi.createProject(session.accessToken, body);
    const response = NextResponse.json(project);
    applyResolvedSession(response, session);
    return response;
  } catch (error) {
    const response = apiErrorResponse(
      error,
      "Unable to create the project right now.",
    );
    applyResolvedSession(response, session);
    return response;
  }
}
