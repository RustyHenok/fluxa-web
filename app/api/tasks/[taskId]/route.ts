import { NextResponse } from "next/server";

import { fluxaApi } from "@/lib/api/client";
import { apiErrorResponse } from "@/lib/api/errors";
import type { TaskPatchPayload } from "@/lib/api/types";
import { applyResolvedSession, resolveServerSession } from "@/lib/auth/session";

interface RouteContext {
  params: Promise<{
    taskId: string;
  }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await resolveServerSession();

  if (!session.accessToken) {
    const response = NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "You need to sign in before updating a task.",
        },
      },
      { status: 401 },
    );
    applyResolvedSession(response, session);
    return response;
  }

  try {
    const body = (await request.json()) as TaskPatchPayload;
    const { taskId } = await context.params;
    const task = await fluxaApi.updateTask(session.accessToken, taskId, body);
    const response = NextResponse.json(task);
    applyResolvedSession(response, session);
    return response;
  } catch (error) {
    const response = apiErrorResponse(error, "Unable to update the task right now.");
    applyResolvedSession(response, session);
    return response;
  }
}
