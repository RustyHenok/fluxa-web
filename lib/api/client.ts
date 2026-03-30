import createClient from "openapi-fetch";

import { getApiBaseUrl } from "@/lib/env";

import type {
  AuthResponse,
  DashboardSummary,
  ErrorEnvelope,
  ExportRequest,
  JobResponse,
  JobResultResponse,
  ListProjectTasksQuery,
  ListTasksQuery,
  LoginRequest,
  LogoutRequest,
  MeResponse,
  RefreshRequest,
  RegisterRequest,
  ProjectPatchPayload,
  ProjectPayload,
  ProjectResponse,
  ProjectSummary,
  TaskAuditListResponse,
  TaskPatchPayload,
  TaskPayload,
  TaskResponse,
  TaskListResponse,
  TenantMemberResponse,
  TenantMembershipResponse,
} from "./types";
import type { paths } from "./generated/schema";

const client = createClient<paths>({
  baseUrl: getApiBaseUrl(),
  headers: {
    Accept: "application/json",
  },
});

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

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  if (typeof value !== "object" || value === null || !("error" in value)) {
    return false;
  }

  const maybeEnvelope = value as Partial<ErrorEnvelope>;
  return (
    typeof maybeEnvelope.error?.code === "string" &&
    typeof maybeEnvelope.error?.message === "string"
  );
}

function authorizedHeaders(
  accessToken?: string,
  extraHeaders?: Record<string, string>,
) {
  const headers = new Headers(extraHeaders);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

function toApiError(response: Response, error: unknown) {
  if (isErrorEnvelope(error)) {
    return new FluxaApiError(
      response.status,
      error.error.code,
      error.error.message,
    );
  }

  return new FluxaApiError(
    response.status,
    "internal_error",
    response.statusText || "Unexpected API error",
  );
}

async function unwrapResponse<T>(
  request: Promise<{
    data?: T;
    error?: unknown;
    response: Response;
  }>,
) {
  const { data, error, response } = await request;

  if (error) {
    throw toApiError(response, error);
  }

  return data as T;
}

export const fluxaApi = {
  login(payload: LoginRequest) {
    return unwrapResponse<AuthResponse>(
      client.POST("/v1/auth/login", {
        body: payload,
      }),
    );
  },
  register(payload: RegisterRequest) {
    return unwrapResponse<AuthResponse>(
      client.POST("/v1/auth/register", {
        body: payload,
      }),
    );
  },
  logout(payload: LogoutRequest) {
    return unwrapResponse<void>(
      client.POST("/v1/auth/logout", {
        body: payload,
      }),
    );
  },
  refresh(payload: RefreshRequest) {
    return unwrapResponse<AuthResponse>(
      client.POST("/v1/auth/refresh", {
        body: payload,
      }),
    );
  },
  switchTenant(accessToken: string, tenantId: string) {
    return unwrapResponse<AuthResponse>(
      client.POST("/v1/auth/switch-tenant", {
        body: { tenant_id: tenantId },
        headers: authorizedHeaders(accessToken),
      }),
    );
  },
  getMe(accessToken: string) {
    return unwrapResponse<MeResponse>(
      client.GET("/v1/me", {
        headers: authorizedHeaders(accessToken),
      }),
    );
  },
  getTenantMemberships(accessToken: string) {
    return unwrapResponse<TenantMembershipResponse[]>(
      client.GET("/v1/me/tenants", {
        headers: authorizedHeaders(accessToken),
      }),
    );
  },
  getDashboardSummary(accessToken: string) {
    return unwrapResponse<DashboardSummary>(
      client.GET("/v1/dashboard/summary", {
        headers: authorizedHeaders(accessToken),
      }),
    );
  },
  listProjects(accessToken: string) {
    return unwrapResponse<ProjectResponse[]>(
      client.GET("/v1/projects", {
        headers: authorizedHeaders(accessToken),
      }),
    );
  },
  createProject(accessToken: string, payload: ProjectPayload) {
    return unwrapResponse<ProjectResponse>(
      client.POST("/v1/projects", {
        body: payload,
        headers: authorizedHeaders(accessToken),
      }),
    );
  },
  getProject(accessToken: string, projectId: string) {
    return unwrapResponse<ProjectResponse>(
      client.GET("/v1/projects/{project_id}", {
        headers: authorizedHeaders(accessToken),
        params: {
          path: {
            project_id: projectId,
          },
        },
      }),
    );
  },
  getProjectSummary(accessToken: string, projectId: string) {
    return unwrapResponse<ProjectSummary>(
      client.GET("/v1/projects/{project_id}/summary", {
        headers: authorizedHeaders(accessToken),
        params: {
          path: {
            project_id: projectId,
          },
        },
      }),
    );
  },
  listProjectTasks(
    accessToken: string,
    projectId: string,
    query?: ListProjectTasksQuery,
  ) {
    return unwrapResponse<TaskListResponse>(
      client.GET("/v1/projects/{project_id}/tasks", {
        headers: authorizedHeaders(accessToken),
        params: {
          path: {
            project_id: projectId,
          },
          query,
        },
      }),
    );
  },
  updateProject(accessToken: string, projectId: string, payload: ProjectPatchPayload) {
    return unwrapResponse<ProjectResponse>(
      client.PATCH("/v1/projects/{project_id}", {
        body: payload,
        headers: authorizedHeaders(accessToken),
        params: {
          path: {
            project_id: projectId,
          },
        },
      }),
    );
  },
  deleteProject(accessToken: string, projectId: string) {
    return unwrapResponse<void>(
      client.DELETE("/v1/projects/{project_id}", {
        headers: authorizedHeaders(accessToken),
        params: {
          path: {
            project_id: projectId,
          },
        },
      }),
    );
  },
  listTasks(accessToken: string, query?: ListTasksQuery) {
    return unwrapResponse<TaskListResponse>(
      client.GET("/v1/tasks", {
        headers: authorizedHeaders(accessToken),
        params: query ? { query } : undefined,
      }),
    );
  },
  getTask(accessToken: string, taskId: string) {
    return unwrapResponse<TaskResponse>(
      client.GET("/v1/tasks/{task_id}", {
        headers: authorizedHeaders(accessToken),
        params: {
          path: {
            task_id: taskId,
          },
        },
      }),
    );
  },
  createTask(accessToken: string, payload: TaskPayload, idempotencyKey: string) {
    return unwrapResponse<TaskResponse>(
      client.POST("/v1/tasks", {
        body: payload,
        headers: authorizedHeaders(accessToken, {
          "Idempotency-Key": idempotencyKey,
        }),
        params: {
          header: {
            "Idempotency-Key": idempotencyKey,
          },
        },
      }),
    );
  },
  updateTask(accessToken: string, taskId: string, payload: TaskPatchPayload) {
    return unwrapResponse<TaskResponse>(
      client.PATCH("/v1/tasks/{task_id}", {
        body: payload,
        headers: authorizedHeaders(accessToken),
        params: {
          path: {
            task_id: taskId,
          },
        },
      }),
    );
  },
  deleteTask(accessToken: string, taskId: string) {
    return unwrapResponse<void>(
      client.DELETE("/v1/tasks/{task_id}", {
        headers: authorizedHeaders(accessToken),
        params: {
          path: {
            task_id: taskId,
          },
        },
      }),
    );
  },
  listTaskAudit(accessToken: string, taskId: string) {
    return unwrapResponse<TaskAuditListResponse>(
      client.GET("/v1/tasks/{task_id}/audit", {
        headers: authorizedHeaders(accessToken),
        params: {
          path: {
            task_id: taskId,
          },
        },
      }),
    );
  },
  listTenantMembers(accessToken: string, tenantId: string) {
    return unwrapResponse<TenantMemberResponse[]>(
      client.GET("/v1/tenants/{tenant_id}/members", {
        headers: authorizedHeaders(accessToken),
        params: {
          path: {
            tenant_id: tenantId,
          },
        },
      }),
    );
  },
  createTaskExport(accessToken: string, payload: ExportRequest, idempotencyKey: string) {
    return unwrapResponse<JobResponse>(
      client.POST("/v1/exports/tasks", {
        body: payload,
        headers: authorizedHeaders(accessToken, {
          "Idempotency-Key": idempotencyKey,
        }),
        params: {
          header: {
            "Idempotency-Key": idempotencyKey,
          },
        },
      }),
    );
  },
  getJob(accessToken: string, jobId: string) {
    return unwrapResponse<JobResponse>(
      client.GET("/v1/jobs/{job_id}", {
        headers: authorizedHeaders(accessToken),
        params: {
          path: {
            job_id: jobId,
          },
        },
      }),
    );
  },
  getJobResult(accessToken: string, jobId: string) {
    return unwrapResponse<JobResultResponse>(
      client.GET("/v1/jobs/{job_id}/result", {
        headers: authorizedHeaders(accessToken),
        params: {
          path: {
            job_id: jobId,
          },
        },
      }),
    );
  },
};
