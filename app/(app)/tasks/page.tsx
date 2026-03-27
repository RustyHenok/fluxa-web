import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  CalendarClock,
  Filter,
  Layers3,
  RefreshCcw,
  UsersRound,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { TenantSwitcher } from "@/components/auth/tenant-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FluxaApiError, fluxaApi } from "@/lib/api/client";
import type {
  DashboardSummary,
  MeResponse,
  TaskListResponse,
  TaskPriority,
  TaskResponse,
  TaskStatus,
  TenantMembershipResponse,
} from "@/lib/api/types";
import { readServerSession } from "@/lib/auth/session";
import { getApiBaseUrl } from "@/lib/env";

const statusBadgeVariant: Record<TaskStatus, "default" | "warning" | "success"> = {
  archived: "default",
  done: "success",
  in_progress: "warning",
  open: "default",
};

const priorityTone: Record<TaskPriority, string> = {
  low: "Low priority",
  medium: "Medium priority",
  high: "High priority",
  urgent: "Urgent",
};

interface ReadyTasksWorkspace {
  kind: "ready";
  me: MeResponse;
  tenants: TenantMembershipResponse[];
  summary: DashboardSummary;
  taskList: TaskListResponse;
}

interface ErrorTasksWorkspace {
  kind: "error";
  message: string;
}

type TasksWorkspaceState = ReadyTasksWorkspace | ErrorTasksWorkspace;

function formatDateTime(value: string | null) {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function describeTaskStatus(task: TaskResponse) {
  return task.status.replaceAll("_", " ");
}

async function getTasksWorkspaceState(accessToken: string): Promise<TasksWorkspaceState> {
  try {
    const [me, tenants, summary, taskList] = await Promise.all([
      fluxaApi.getMe(accessToken),
      fluxaApi.getTenantMemberships(accessToken),
      fluxaApi.getDashboardSummary(accessToken),
      fluxaApi.listTasks(accessToken, {
        limit: 6,
      }),
    ]);

    return {
      kind: "ready",
      me,
      tenants,
      summary,
      taskList,
    };
  } catch (error) {
    if (error instanceof FluxaApiError && error.status === 401) {
      redirect("/login");
    }

    return {
      kind: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to reach the Fluxa backend right now.",
    };
  }
}

export default async function TasksPage() {
  const session = await readServerSession();

  if (!session.accessToken) {
    redirect("/login");
  }

  const state = await getTasksWorkspaceState(session.accessToken);

  if (state.kind === "error") {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-12">
        <Card className="w-full bg-white/85">
          <CardHeader>
            <CardTitle>Workspace bootstrap is ready, but the API is unavailable</CardTitle>
            <CardDescription>
              The typed client and session layer are in place. The page just
              could not reach the backend for live tenant data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-[24px] border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
              {state.message}
            </p>
            <div className="rounded-[24px] border border-border/80 bg-background/80 p-4 text-sm text-muted-foreground">
              <p>Expected API base URL: {getApiBaseUrl()}</p>
              <p className="mt-2">
                Set <code>FLUXA_API_BASE_URL</code> in <code>.env.local</code> if your
                backend is running somewhere else.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/login">Return to login</Link>
              </Button>
              <LogoutButton variant="outline">Clear session cookies</LogoutButton>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { me, tenants, summary, taskList } = state;
  const metrics = [
    { label: "Open", value: summary.open_task_count, tone: "default" as const },
    {
      label: "In Progress",
      value: summary.in_progress_task_count,
      tone: "warning" as const,
    },
    { label: "Done", value: summary.done_task_count, tone: "success" as const },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-10">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>Fluxa Workspace</CardTitle>
            <CardDescription className="text-primary-foreground/75">
              Cookie-backed session handling is live, and this panel is now
              driven by the real tenant-scoped backend contract.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/65">
                Signed in as
              </p>
              <p className="mt-3 text-base font-medium">{me.user.email}</p>
            </div>

            <TenantSwitcher
              activeTenantId={me.active_tenant.tenant_id}
              tenants={tenants}
            />

            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/65">
                Memberships
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <UsersRound className="h-4 w-4" />
                {tenants.length} tenant{tenants.length === 1 ? "" : "s"} available
              </div>
            </div>

            <LogoutButton className="w-full bg-white text-primary hover:bg-white/90">
              Sign out
            </LogoutButton>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge className="mb-3 w-fit">
                {me.active_tenant.tenant_name} · {me.active_tenant.role}
              </Badge>
              <h1 className="text-4xl font-semibold tracking-[-0.04em]">
                Contract-aware task dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                The summary cards and task list below are fetched from the
                backend through the typed web API layer. This is the starting
                point for richer filters, exports, and audit history.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Overview
                </Link>
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters next
              </Button>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            {metrics.map((metric) => (
              <Card key={metric.label} className="bg-white/80">
                <CardHeader className="pb-3">
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="text-4xl">{metric.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={metric.tone}>live dashboard summary</Badge>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card className="bg-white/85">
              <CardHeader>
                <CardDescription>Overdue work</CardDescription>
                <CardTitle className="text-4xl">{summary.overdue_task_count}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">
                  Tasks past due in the active tenant.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/85">
              <CardHeader>
                <CardDescription>Recent activity</CardDescription>
                <CardTitle className="text-4xl">{summary.recent_activity_count}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">
                  Audit events captured in the last 7 days.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/85">
              <CardHeader>
                <CardDescription>Contract status</CardDescription>
                <CardTitle className="text-2xl">OpenAPI synced</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                <Layers3 className="h-4 w-4" />
                Ready for generated TS client follow-up
              </CardContent>
            </Card>
          </section>

          <Card className="bg-white/85">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Task feed</CardTitle>
                <CardDescription>
                  The first live tenant-scoped task slice from the backend.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Layers3 className="h-4 w-4" />
                {taskList.next_cursor ? "More tasks available" : "Current page complete"}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {taskList.data.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border/80 bg-background/70 p-5 text-sm text-muted-foreground">
                  No tasks yet for this tenant. The next slice can wire create
                  task, patch flows, and export jobs into this workspace.
                </div>
              ) : null}

              {taskList.data.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-3 rounded-[24px] border border-border/80 bg-background/80 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{task.title}</h2>
                      <Badge variant={statusBadgeVariant[task.status]}>
                        {describeTaskStatus(task)}
                      </Badge>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {task.description || "No description provided yet."}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <CalendarClock className="h-4 w-4" />
                        {formatDateTime(task.due_at)}
                      </span>
                      <span>{priorityTone[task.priority]}</span>
                    </div>
                  </div>
                  <Button asChild variant="outline">
                    <Link href="/">
                      View details next
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
