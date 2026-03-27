import { FluxaApiError, fluxaApi } from "@/lib/api/client";
import type { AuthResponse } from "@/lib/api/types";

export async function refreshSessionWithToken(
  refreshToken: string,
  tenantId?: string | null,
) {
  return fluxaApi.refresh({
    refresh_token: refreshToken,
    tenant_id: tenantId ?? undefined,
  });
}

export function isRefreshExpired(error: unknown) {
  return error instanceof FluxaApiError && error.status === 401;
}

export function isRefreshRateLimited(error: unknown) {
  return error instanceof FluxaApiError && error.status === 429;
}
