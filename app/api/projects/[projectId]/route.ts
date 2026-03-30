import { NextResponse } from "next/server";

import { fluxaApi } from "@/lib/api/client";
import { apiErrorResponse } from "@/lib/api/errors";
import type { ProjectPatchPayload } from "@/lib/api/types";
import { applyResolvedSession, resolveServerSession } from "@/lib/auth/session";

interface RouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await resolveServerSession();

  if (!session.accessToken) {
    const response = NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "You need to sign in before updating a project.",
        },
      },
      { status: 401 },
    );
    applyResolvedSession(response, session);
    return response;
  }

  try {
    const body = (await request.json()) as ProjectPatchPayload;
    const { projectId } = await context.params;
    const project = await fluxaApi.updateProject(
      session.accessToken,
      projectId,
      body,
    );
    const response = NextResponse.json(project);
    applyResolvedSession(response, session);
    return response;
  } catch (error) {
    const response = apiErrorResponse(
      error,
      "Unable to update the project right now.",
    );
    applyResolvedSession(response, session);
    return response;
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await resolveServerSession();

  if (!session.accessToken) {
    const response = NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "You need to sign in before deleting a project.",
        },
      },
      { status: 401 },
    );
    applyResolvedSession(response, session);
    return response;
  }

  try {
    const { projectId } = await context.params;
    await fluxaApi.deleteProject(session.accessToken, projectId);
    const response = new NextResponse(null, { status: 204 });
    applyResolvedSession(response, session);
    return response;
  } catch (error) {
    const response = apiErrorResponse(
      error,
      "Unable to delete the project right now.",
    );
    applyResolvedSession(response, session);
    return response;
  }
}
