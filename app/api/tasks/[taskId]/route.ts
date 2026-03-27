import { NextResponse } from "next/server";

import { fluxaApi } from "@/lib/api/client";
import { apiErrorResponse } from "@/lib/api/errors";
import type { TaskPatchPayload } from "@/lib/api/types";
import { readServerSession } from "@/lib/auth/session";

interface RouteContext {
  params: Promise<{
    taskId: string;
  }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await readServerSession();

  if (!session.accessToken) {
    return NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "You need to sign in before updating a task.",
        },
      },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as TaskPatchPayload;
    const { taskId } = await context.params;
    const task = await fluxaApi.updateTask(session.accessToken, taskId, body);
    return NextResponse.json(task);
  } catch (error) {
    return apiErrorResponse(error, "Unable to update the task right now.");
  }
}
