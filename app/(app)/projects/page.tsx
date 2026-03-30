import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Layers3, RefreshCcw, UsersRound } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { TenantSwitcher } from "@/components/auth/tenant-switcher";
import { CreateProjectForm } from "@/components/projects/create-project-form";
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
import type { MeResponse, ProjectResponse, TenantMembershipResponse } from "@/lib/api/types";
import { readServerSession } from "@/lib/auth/session";
import { getApiBaseUrl } from "@/lib/env";

interface ReadyProjectsState {
  kind: "ready";
  me: MeResponse;
  projects: ProjectResponse[];
  tenants: TenantMembershipResponse[];
}

interface ErrorProjectsState {
  kind: "error";
  message: string;
}

type ProjectsState = ReadyProjectsState | ErrorProjectsState;

async function loadProjectsState(accessToken: string): Promise<ProjectsState> {
  try {
    const [me, tenants, projects] = await Promise.all([
      fluxaApi.getMe(accessToken),
      fluxaApi.getTenantMemberships(accessToken),
      fluxaApi.listProjects(accessToken),
    ]);

    return {
      kind: "ready",
      me,
      projects,
      tenants,
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
          : "Unable to load tenant projects right now.",
    };
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function ProjectsPage() {
  const session = await readServerSession();

  if (!session.accessToken) {
    redirect("/login");
  }

  const state = await loadProjectsState(session.accessToken);

  if (state.kind === "error") {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-12">
        <Card className="w-full bg-white/85">
          <CardHeader>
            <CardTitle>Project workspace is ready, but the API is unavailable</CardTitle>
            <CardDescription>
              The route is wired, but live project data could not load from the backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-[24px] border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
              {state.message}
            </p>
            <div className="rounded-[24px] border border-border/80 bg-background/80 p-4 text-sm text-muted-foreground">
              <p>Expected API base URL: {getApiBaseUrl()}</p>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/tasks">Open tasks</Link>
              </Button>
              <LogoutButton variant="outline">Clear session cookies</LogoutButton>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { me, projects, tenants } = state;
  const latestProject = projects[0] ?? null;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-10">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>Project hierarchy</CardTitle>
            <CardDescription className="text-primary-foreground/75">
              Create named workstreams and move through project-level summaries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/65">
                Active tenant
              </p>
              <p className="mt-3 text-base font-medium">
                {me.active_tenant.tenant_name}
              </p>
            </div>

            <TenantSwitcher
              activeTenantId={me.active_tenant.tenant_id}
              tenants={tenants}
            />

            <div className="rounded-[24px] bg-white/10 p-4">
              <div className="flex items-center gap-2 text-sm">
                <UsersRound className="h-4 w-4" />
                {projects.length} project{projects.length === 1 ? "" : "s"} available
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
                Project workspace
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Projects now have a dedicated surface in the web app, backed by
                the backend hierarchy and project summary endpoints.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Overview
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/tasks">
                  <Layers3 className="mr-2 h-4 w-4" />
                  Tasks
                </Link>
              </Button>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <Card className="bg-white/85">
              <CardHeader>
                <CardDescription>Total projects</CardDescription>
                <CardTitle className="text-4xl">{projects.length}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Tenant-scoped project hierarchy is now first-class in the web UI.
              </CardContent>
            </Card>

            <Card className="bg-white/85">
              <CardHeader>
                <CardDescription>Latest update</CardDescription>
                <CardTitle className="text-2xl">
                  {latestProject ? latestProject.name : "No projects yet"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {latestProject
                  ? `Updated ${formatDateTime(latestProject.updated_at)}`
                  : "Create the first project to start grouping work."}
              </CardContent>
            </Card>

            <Card className="bg-white/85">
              <CardHeader>
                <CardDescription>Recommended flow</CardDescription>
                <CardTitle className="text-2xl">Project → Tasks</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Define workstreams here, then create or filter tasks within each project.
              </CardContent>
            </Card>
          </section>

          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle>Create project</CardTitle>
              <CardDescription>
                Projects are tenant-scoped and become available immediately for
                task assignment and project-specific dashboards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateProjectForm />
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>
                Open a project to inspect its summary and project-scoped task feed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {projects.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border/80 bg-background/70 p-5 text-sm text-muted-foreground">
                  No projects yet for this tenant. Create one above to start structuring work.
                </div>
              ) : null}

              {projects.map((project) => (
                <div
                  className="flex flex-col gap-3 rounded-[24px] border border-border/80 bg-background/80 p-5 md:flex-row md:items-center md:justify-between"
                  key={project.id}
                >
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">{project.name}</h2>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {project.description || "No project description yet."}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Updated {formatDateTime(project.updated_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline">
                      <Link href={`/tasks?project_id=${project.id}`}>View tasks</Link>
                    </Button>
                    <Button asChild>
                      <Link href={`/projects/${project.id}`}>
                        Open project
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
