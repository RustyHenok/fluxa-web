import { NextResponse } from "next/server";

import { fluxaApi } from "@/lib/api/client";
import { apiErrorResponse } from "@/lib/api/errors";
import type { TaskPayload } from "@/lib/api/types";
import { applyResolvedSession, resolveServerSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const session = await resolveServerSession();

  if (!session.accessToken) {
    const response = NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "You need to sign in before creating a task.",
        },
      },
      { status: 401 },
    );
    applyResolvedSession(response, session);
    return response;
  }

  try {
    const body = (await request.json()) as TaskPayload;
    const idempotencyKey =
      request.headers.get("Idempotency-Key") ?? crypto.randomUUID();

    const task = await fluxaApi.createTask(session.accessToken, body, idempotencyKey);
    const response = NextResponse.json(task);
    applyResolvedSession(response, session);
    return response;
  } catch (error) {
    const response = apiErrorResponse(error, "Unable to create the task right now.");
    applyResolvedSession(response, session);
    return response;
  }
}
