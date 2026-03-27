export type MembershipRole = "owner" | "admin" | "member";
export type TaskStatus = "open" | "in_progress" | "done" | "archived";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type JobStatus = "queued" | "running" | "completed" | "dead_letter";
export type JobType = "task_export" | "due_reminder_sweep";

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
  };
}

export interface UserResponse {
  id: string;
  email: string;
  created_at: string;
}

export interface TenantMembershipResponse {
  tenant_id: string;
  tenant_name: string;
  role: MembershipRole;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in_seconds: number;
  user: UserResponse;
  active_tenant: TenantMembershipResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenant_id?: string | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  tenant_name?: string | null;
}

export interface SwitchTenantRequest {
  tenant_id: string;
}

export interface MeResponse {
  user: UserResponse;
  active_tenant: TenantMembershipResponse;
}

export interface TenantMemberResponse {
  user_id: string;
  email: string;
  role: MembershipRole;
  joined_at: string;
}

export interface DashboardSummary {
  open_task_count: number;
  in_progress_task_count: number;
  done_task_count: number;
  overdue_task_count: number;
  recent_activity_count: number;
}

export interface TaskResponse {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  due_at: string | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  data: TaskResponse[];
  next_cursor: string | null;
}

export interface ListTasksQuery {
  limit?: number;
  cursor?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  due_before?: string;
  due_after?: string;
  updated_after?: string;
  q?: string;
}

