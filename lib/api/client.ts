import { getApiBaseUrl } from "@/lib/env";

import type {
  AuthResponse,
  DashboardSummary,
  ErrorEnvelope,
  ExportRequest,
  JobResponse,
  JobResultResponse,
  ListTasksQuery,
  LoginRequest,
  MeResponse,
  RefreshRequest,
  RegisterRequest,
  TaskAuditListResponse,
  TaskPatchPayload,
  TaskPayload,
  TaskResponse,
  TaskListResponse,
  TenantMemberResponse,
  TenantMembershipResponse,
} from "./types";

export class FluxaApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "FluxaApiError";
  }
}

function buildQueryString(query?: ListTasksQuery) {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  const output = params.toString();
  return output ? `?${output}` : "";
}

async function parseJson<T>(response: Response) {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function fluxaRequest<T>(
  path: string,
  init: RequestInit & {
    accessToken?: string;
    query?: ListTasksQuery;
  } = {},
) {
  const { accessToken, query, headers, ...rest } = init;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type") && rest.body) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}${buildQueryString(query)}`, {
    ...rest,
    headers: requestHeaders,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Unexpected API error";
    let code = "internal_error";

    try {
      const body = await parseJson<ErrorEnvelope>(response);
      message = body.error.message;
      code = body.error.code;
    } catch {
      message = response.statusText || message;
    }

    throw new FluxaApiError(response.status, code, message);
  }

  return parseJson<T>(response);
}

export const fluxaApi = {
  login(payload: LoginRequest) {
    return fluxaRequest<AuthResponse>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  register(payload: RegisterRequest) {
    return fluxaRequest<AuthResponse>("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  refresh(payload: RefreshRequest) {
    return fluxaRequest<AuthResponse>("/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  switchTenant(accessToken: string, tenantId: string) {
    return fluxaRequest<AuthResponse>("/v1/auth/switch-tenant", {
      method: "POST",
      accessToken,
      body: JSON.stringify({ tenant_id: tenantId }),
    });
  },
  getMe(accessToken: string) {
    return fluxaRequest<MeResponse>("/v1/me", {
      accessToken,
    });
  },
  getTenantMemberships(accessToken: string) {
    return fluxaRequest<TenantMembershipResponse[]>("/v1/me/tenants", {
      accessToken,
    });
  },
  getDashboardSummary(accessToken: string) {
    return fluxaRequest<DashboardSummary>("/v1/dashboard/summary", {
      accessToken,
    });
  },
  listTasks(accessToken: string, query?: ListTasksQuery) {
    return fluxaRequest<TaskListResponse>("/v1/tasks", {
      accessToken,
      query,
    });
  },
  getTask(accessToken: string, taskId: string) {
    return fluxaRequest<TaskResponse>(`/v1/tasks/${taskId}`, {
      accessToken,
    });
  },
  createTask(accessToken: string, payload: TaskPayload, idempotencyKey: string) {
    return fluxaRequest<TaskResponse>("/v1/tasks", {
      method: "POST",
      accessToken,
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    });
  },
  updateTask(accessToken: string, taskId: string, payload: TaskPatchPayload) {
    return fluxaRequest<TaskResponse>(`/v1/tasks/${taskId}`, {
      method: "PATCH",
      accessToken,
      body: JSON.stringify(payload),
    });
  },
  listTaskAudit(accessToken: string, taskId: string) {
    return fluxaRequest<TaskAuditListResponse>(`/v1/tasks/${taskId}/audit`, {
      accessToken,
    });
  },
  listTenantMembers(accessToken: string, tenantId: string) {
    return fluxaRequest<TenantMemberResponse[]>(`/v1/tenants/${tenantId}/members`, {
      accessToken,
    });
  },
  createTaskExport(accessToken: string, payload: ExportRequest, idempotencyKey: string) {
    return fluxaRequest<JobResponse>("/v1/exports/tasks", {
      method: "POST",
      accessToken,
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    });
  },
  getJob(accessToken: string, jobId: string) {
    return fluxaRequest<JobResponse>(`/v1/jobs/${jobId}`, {
      accessToken,
    });
  },
  getJobResult(accessToken: string, jobId: string) {
    return fluxaRequest<JobResultResponse>(`/v1/jobs/${jobId}/result`, {
      accessToken,
    });
  },
};
