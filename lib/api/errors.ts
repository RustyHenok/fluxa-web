import { NextResponse } from "next/server";

import { FluxaApiError } from "@/lib/api/client";

export function apiErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof FluxaApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.status },
    );
  }

  return NextResponse.json(
    {
      error: {
        code: "internal_error",
        message: fallbackMessage,
      },
    },
    { status: 500 },
  );
}
