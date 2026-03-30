import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowUpRight, ChevronLeft, Layers3, RefreshCcw } from "lucide-react";

import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { ProjectDetailActions } from "@/components/projects/project-detail-actions";
import { ProjectEditorForm } from "@/components/projects/project-editor-form";
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
import type { ProjectResponse, ProjectSummary, TaskListResponse, TenantMemberResponse } from "@/lib/api/types";
import { readServerSession } from "@/lib/auth/session";
import {
  formatTaskDateTime,
  formatTaskPriorityLabel,
  formatTaskStatusLabel,
} from "@/lib/tasks";

interface ProjectDetailPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

interface LoadedProjectDetail {
  members: TenantMemberResponse[];
  project: ProjectResponse;
  projects: ProjectResponse[];
  summary: ProjectSummary;
  taskList: TaskListResponse;
}

async function loadProjectDetail(
  accessToken: string,
  projectId: string,
): Promise<LoadedProjectDetail> {
  try {
    const [project, summary, taskList, me, projects] = await Promise.all([
      fluxaApi.getProject(accessToken, projectId),
      fluxaApi.getProjectSummary(accessToken, projectId),
      fluxaApi.listProjectTasks(accessToken, projectId, { limit: 8 }),
      fluxaApi.getMe(accessToken),
      fluxaApi.listProjects(accessToken),
    ]);

    const members = await fluxaApi.listTenantMembers(
      accessToken,
      me.active_tenant.tenant_id,
    );

    return {
      members,
      project,
      projects,
      summary,
      taskList,
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const session = await readServerSession();

  if (!session.accessToken) {
    redirect("/login");
  }

  const { projectId } = await params;
  const { members, project, projects, summary, taskList } = await loadProjectDetail(
    session.accessToken,
    projectId,
  );

  const metrics = [
    { label: "Open", value: summary.open_task_count },
    { label: "In progress", value: summary.in_progress_task_count },
    { label: "Done", value: summary.done_task_count },
    { label: "Overdue", value: summary.overdue_task_count },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-10">
      <div className="mb-6 flex flex-wrap gap-3">
        <Button asChild variant="ghost">
          <Link href="/projects">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/tasks?project_id=${project.id}`}>
            <Layers3 className="mr-2 h-4 w-4" />
            Project task slice
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/tasks">
            <RefreshCcw className="mr-2 h-4 w-4" />
            All tasks
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card className="bg-white/85">
            <CardHeader>
              <Badge className="mb-3 w-fit">Project hierarchy</Badge>
              <CardTitle className="text-3xl">{project.name}</CardTitle>
              <CardDescription>
                Created {formatDateTime(project.created_at)} and last updated{" "}
                {formatDateTime(project.updated_at)}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] border border-border/80 bg-background/80 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Description
                </p>
                <p className="mt-3 text-sm leading-7 text-foreground">
                  {project.description || "No project description provided yet."}
                </p>
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <Card className="bg-white/85" key={metric.label}>
                <CardHeader>
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="text-4xl">{metric.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </section>

          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>
                Audit-derived events for this project over the last 7 days.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {summary.recent_activity_count} recent event
              {summary.recent_activity_count === 1 ? "" : "s"} recorded.
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle>Create task in project</CardTitle>
              <CardDescription>
                New tasks created here are pre-linked to this project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateTaskForm
                initialProjectId={project.id}
                members={members}
                projects={projects}
              />
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle>Project tasks</CardTitle>
              <CardDescription>
                Project-scoped task listing backed by `/v1/projects/:project_id/tasks`.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {taskList.data.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border/80 bg-background/70 p-5 text-sm text-muted-foreground">
                  No tasks are linked to this project yet.
                </div>
              ) : null}

              {taskList.data.map((task) => (
                <div
                  className="flex flex-col gap-3 rounded-[24px] border border-border/80 bg-background/80 p-5 md:flex-row md:items-center md:justify-between"
                  key={task.id}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{task.title}</h2>
                      <Badge>{formatTaskStatusLabel(task.status)}</Badge>
                      <Badge variant="warning">
                        {formatTaskPriorityLabel(task.priority)}
                      </Badge>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {task.description || "No description provided yet."}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due {formatTaskDateTime(task.due_at)}
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/tasks/${task.id}`}>
                      Open task
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Edit project</CardTitle>
              <CardDescription className="text-primary-foreground/75">
                Rename or reshape the project without leaving the hierarchy view.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectEditorForm project={project} />
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle>Project actions</CardTitle>
              <CardDescription>
                Deleting a project removes the grouping but keeps tasks available.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectDetailActions project={project} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
