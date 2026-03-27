import { NextResponse } from "next/server";

import { fluxaApi } from "@/lib/api/client";
import { apiErrorResponse } from "@/lib/api/errors";
import type { TaskPayload } from "@/lib/api/types";
import { readServerSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const session = await readServerSession();

  if (!session.accessToken) {
    return NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "You need to sign in before creating a task.",
        },
      },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as TaskPayload;
    const idempotencyKey =
      request.headers.get("Idempotency-Key") ?? crypto.randomUUID();

    const task = await fluxaApi.createTask(session.accessToken, body, idempotencyKey);
    return NextResponse.json(task);
  } catch (error) {
    return apiErrorResponse(error, "Unable to create the task right now.");
  }
}
