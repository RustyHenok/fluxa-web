import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarClock, ChevronLeft, Layers3, UserRound } from "lucide-react";

import { TaskDetailActions } from "@/components/tasks/task-detail-actions";
import { TaskEditorForm } from "@/components/tasks/task-editor-form";
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
import type { TaskPriority, TaskStatus } from "@/lib/api/types";
import { readServerSession } from "@/lib/auth/session";
import { formatEventLabel } from "@/lib/tasks";

interface TaskDetailPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

const statusBadgeVariant: Record<TaskStatus, "default" | "warning" | "success"> = {
  archived: "default",
  done: "success",
  in_progress: "warning",
  open: "default",
};

const priorityLabel: Record<TaskPriority, string> = {
  low: "Low priority",
  medium: "Medium priority",
  high: "High priority",
  urgent: "Urgent",
};

interface LoadedTaskDetail {
  projects: Awaited<ReturnType<typeof fluxaApi.listProjects>>;
  task: Awaited<ReturnType<typeof fluxaApi.getTask>>;
  audit: Awaited<ReturnType<typeof fluxaApi.listTaskAudit>>;
  members: Awaited<ReturnType<typeof fluxaApi.listTenantMembers>>;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

async function loadTaskDetail(accessToken: string, taskId: string): Promise<LoadedTaskDetail> {
  try {
    const task = await fluxaApi.getTask(accessToken, taskId);
    const [audit, members, projects] = await Promise.all([
      fluxaApi.listTaskAudit(accessToken, taskId),
      fluxaApi.listTenantMembers(accessToken, task.tenant_id),
      fluxaApi.listProjects(accessToken),
    ]);

    return {
      projects,
      task,
      audit,
      members,
    };
  } catch (error) {
    if (error instanceof FluxaApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof FluxaApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const session = await readServerSession();

  if (!session.accessToken) {
    redirect("/login");
  }

  const { taskId } = await params;
  const { task, audit, members, projects } = await loadTaskDetail(
    session.accessToken,
    taskId,
  );
  const assignee = members.find((member) => member.user_id === task.assignee_id);
  const project = projects.find((candidate) => candidate.id === task.project_id);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-10">
      <div className="mb-6">
        <Button asChild variant="ghost">
          <Link href="/tasks">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to tasks
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card className="bg-white/85">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={statusBadgeVariant[task.status]}>{task.status}</Badge>
                <Badge>{priorityLabel[task.priority]}</Badge>
              </div>
              <CardTitle className="text-3xl">{task.title}</CardTitle>
              <CardDescription>
                Created {formatDateTime(task.created_at)} and last updated{" "}
                {formatDateTime(task.updated_at)}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-border/80 bg-background/80 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Description
                </p>
                <p className="mt-3 text-sm leading-7 text-foreground">
                  {task.description || "No description provided yet."}
                </p>
              </div>
              <div className="rounded-[24px] border border-border/80 bg-background/80 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Assignment
                </p>
                <div className="mt-3 space-y-3 text-sm text-foreground">
                  <p className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    {assignee ? assignee.email : "Unassigned"}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    {formatDateTime(task.due_at)}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Layers3 className="h-4 w-4 text-muted-foreground" />
                    {project ? (
                      <Link
                        className="text-primary hover:underline"
                        href={`/projects/${project.id}`}
                      >
                        {project.name}
                      </Link>
                    ) : (
                      "No project"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle>Task activity</CardTitle>
              <CardDescription>
                Audit history from the backend task timeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {audit.data.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border/80 bg-background/70 p-5 text-sm text-muted-foreground">
                  No audit events yet.
                </div>
              ) : null}

              {audit.data.map((entry) => (
                <div
                  className="rounded-[24px] border border-border/80 bg-background/80 p-5"
                  key={entry.id}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="warning">{formatEventLabel(entry.event_type)}</Badge>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {formatDateTime(entry.created_at)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Actor: {entry.actor_user_id}
                  </p>
                  <pre className="mt-4 overflow-x-auto rounded-[20px] bg-secondary/50 p-4 text-xs leading-6 text-foreground">
                    {prettyJson(entry.payload)}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Update task</CardTitle>
              <CardDescription className="text-primary-foreground/75">
                This editor patches the live backend record and refreshes the
                audit timeline after each save.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskEditorForm members={members} projects={projects} task={task} />
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle>Task actions</CardTitle>
              <CardDescription>
                Archive work that should leave the active queue, or delete a
                task entirely when it should no longer exist.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskDetailActions task={task} />
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle>Quick facts</CardTitle>
              <CardDescription>
                Stable identifiers from the backend contract.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="rounded-[20px] bg-background/70 p-4">
                Task ID: <span className="font-medium text-foreground">{task.id}</span>
              </p>
              <p className="rounded-[20px] bg-background/70 p-4">
                Tenant ID:{" "}
                <span className="font-medium text-foreground">{task.tenant_id}</span>
              </p>
              <p className="rounded-[20px] bg-background/70 p-4">
                Project ID:{" "}
                <span className="font-medium text-foreground">
                  {task.project_id ?? "No project"}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
