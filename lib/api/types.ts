import type { components, paths } from "./generated/schema";

export type ApiComponents = components;
export type ApiPaths = paths;

export type ErrorEnvelope = components["schemas"]["ErrorEnvelope"];
export type FreeformObject = components["schemas"]["FreeformObject"];

export type AuthResponse = components["schemas"]["AuthResponse"];
export type DashboardSummary = components["schemas"]["DashboardSummary"];
export type ExportRequest = components["schemas"]["ExportRequest"];
export type JobResponse = components["schemas"]["JobResponse"];
export type JobResultResponse = components["schemas"]["JobResultResponse"];
export type JobStatus = components["schemas"]["JobStatus"];
export type JobType = components["schemas"]["JobType"];
export type LoginRequest = components["schemas"]["LoginRequest"];
export type LogoutRequest = components["schemas"]["LogoutRequest"];
export type MeResponse = components["schemas"]["MeResponse"];
export type MembershipRole = components["schemas"]["MembershipRole"];
export type RefreshRequest = components["schemas"]["RefreshRequest"];
export type RegisterRequest = components["schemas"]["RegisterRequest"];
export type SwitchTenantRequest = components["schemas"]["SwitchTenantRequest"];
export type TaskAuditListResponse = components["schemas"]["TaskAuditListResponse"];
export type TaskAuditResponse = components["schemas"]["TaskAuditResponse"];
export type TaskExportJobResult = components["schemas"]["TaskExportJobResult"];
export type TaskFilters = components["schemas"]["TaskFilters"];
export type TaskListResponse = components["schemas"]["TaskListResponse"];
export type TaskPatchPayload = components["schemas"]["TaskPatchPayload"];
export type TaskPayload = components["schemas"]["TaskPayload"];
export type TaskPriority = components["schemas"]["TaskPriority"];
export type TaskResponse = components["schemas"]["TaskResponse"];
export type TaskStatus = components["schemas"]["TaskStatus"];
export type TenantMemberResponse = components["schemas"]["TenantMemberResponse"];
export type TenantMembershipResponse =
  components["schemas"]["TenantMembershipResponse"];

export type ListTasksQuery = NonNullable<
  paths["/v1/tasks"]["get"]["parameters"]["query"]
>;
export type ListTaskAuditQuery = NonNullable<
  paths["/v1/tasks/{task_id}/audit"]["get"]["parameters"]["query"]
>;
