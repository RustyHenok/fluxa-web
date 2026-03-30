import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  DownloadCloud,
  Layers3,
  ShieldCheck,
  Smartphone,
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
  TaskStatus,
  TenantMemberResponse,
  TenantMembershipResponse,
} from "@/lib/api/types";
import { resolveServerSession } from "@/lib/auth/session";
import {
  formatTaskDateTime,
  formatTaskPriorityLabel,
  formatTaskStatusLabel,
} from "@/lib/tasks";

const pillars = [
  {
    icon: Layers3,
    title: "Tenant-aware by default",
    description:
      "Every task, audit entry, export, and dashboard view is scoped around the active tenant session.",
  },
  {
    icon: ShieldCheck,
    title: "Production contract first",
    description:
      "The web app now runs on top of the synced OpenAPI contract with generated request and response types.",
  },
  {
    icon: Smartphone,
    title: "Aligned with mobile",
    description:
      "The Next.js dashboard and the upcoming Flutter app are both moving against the same backend behaviors.",
  },
];

const statusBadgeVariant: Record<TaskStatus, "default" | "warning" | "success"> = {
  archived: "default",
  done: "success",
  in_progress: "warning",
  open: "default",
};

const priorityTone: Record<TaskPriority, string> = {
  low: "Quietly queued",
  medium: "Steady work",
  high: "Needs attention",
  urgent: "Top priority",
};

interface ReadyOverviewState {
  kind: "ready";
  me: MeResponse;
  tenants: TenantMembershipResponse[];
  summary: DashboardSummary;
  tasks: TaskListResponse;
  members: TenantMemberResponse[];
}

interface ErrorOverviewState {
  kind: "error";
  message: string;
}

type OverviewState = ReadyOverviewState | ErrorOverviewState;

async function loadOverviewState(accessToken: string): Promise<OverviewState> {
  try {
    const [me, tenants, summary, tasks] = await Promise.all([
      fluxaApi.getMe(accessToken),
      fluxaApi.getTenantMemberships(accessToken),
      fluxaApi.getDashboardSummary(accessToken),
      fluxaApi.listTasks(accessToken, {
        limit: 4,
      }),
    ]);

    const members = await fluxaApi.listTenantMembers(
      accessToken,
      me.active_tenant.tenant_id,
    );

    return {
      kind: "ready",
      me,
      tenants,
      summary,
      tasks,
      members,
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
          : "Unable to load the overview dashboard right now.",
    };
  }
}

function PublicLanding() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-hero-grid opacity-30 [background-size:42px_42px]" />
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-14 md:px-10">
        <div className="animate-fade-up space-y-8">
          <Badge className="w-fit" variant="warning">
            Next.js + Tailwind + shadcn/ui
          </Badge>

          <div className="max-w-4xl space-y-5">
            <h1 className="text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl">
              Fluxa web is ready to act like a real control surface, not just a
              frontend scaffold.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              Auth, tenant switching, task dashboards, export jobs, generated
              API types, and loading states are already in place. The next
              slices keep tightening the actual product experience.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Create workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/tasks">Explore task workspace</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-white/80 bg-white/80">
            <CardHeader>
              <CardTitle>What is already live</CardTitle>
              <CardDescription>
                The app is already speaking to the real multi-tenant backend.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {pillars.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-border/80 bg-background/80 p-5"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-secondary p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold">{title}</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Current product slices</CardTitle>
              <CardDescription className="text-primary-foreground/75">
                The web app is already past scaffolding and into real workflow
                coverage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] bg-white/10 p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-primary-foreground/65">
                  Live features
                </p>
                <ul className="mt-3 space-y-3 text-sm leading-7">
                  <li>Cookie-backed auth and tenant switching</li>
                  <li>Signed-in dashboard summary and overview</li>
                  <li>Task list with filters, date slices, and pagination</li>
                  <li>Task detail, audit timeline, archive, and delete</li>
                  <li>Export job creation, polling, and result retrieval</li>
                </ul>
              </div>
              <Button asChild className="w-full bg-white text-primary hover:bg-white/90">
                <Link href="/register">Start your workspace</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function OverviewErrorState({ message }: { message: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-12">
      <Card className="w-full bg-white/85">
        <CardHeader>
          <CardTitle>Overview is wired, but the backend is unavailable</CardTitle>
          <CardDescription>
            Your session exists, but the dashboard could not load live tenant
            data from the API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="rounded-[24px] border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
            {message}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/tasks">Open task workspace</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Return to login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function SignedInOverview({
  me,
  members,
  summary,
  tasks,
  tenants,
}: ReadyOverviewState) {
  const summaryCards = [
    { label: "Open", value: summary.open_task_count, tone: "default" as const },
    {
      label: "In Progress",
      value: summary.in_progress_task_count,
      tone: "warning" as const,
    },
    { label: "Done", value: summary.done_task_count, tone: "success" as const },
    {
      label: "Overdue",
      value: summary.overdue_task_count,
      tone: "warning" as const,
    },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-10">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>Workspace overview</CardTitle>
            <CardDescription className="text-primary-foreground/75">
              Start from the tenant summary, then move into task execution and
              export workflows.
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

            <div className="grid gap-3">
              <div className="rounded-[24px] bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/65">
                  Team footprint
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <UsersRound className="h-4 w-4" />
                  {members.length} assignable members
                </div>
              </div>

              <div className="rounded-[24px] bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/65">
                  Tenant access
                </p>
                <p className="mt-3 text-sm">
                  {tenants.length} tenant{tenants.length === 1 ? "" : "s"} available
                </p>
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
                Good to have you back
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                This overview turns the root route into a live control layer for
                the active tenant instead of a static landing page.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/tasks">
                  Open task workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/projects">
                  <Layers3 className="mr-2 h-4 w-4" />
                  Projects
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/exports">
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Exports
                </Link>
              </Button>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <Card className="bg-white/85" key={card.label}>
                <CardHeader className="pb-3">
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="text-4xl">{card.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={card.tone}>live tenant summary</Badge>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="bg-white/85">
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Recent task pulse</CardTitle>
                  <CardDescription>
                    Freshly updated tasks from the active tenant, straight from
                    the backend list contract.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Layers3 className="h-4 w-4" />
                  {tasks.next_cursor ? "More tasks available" : "Current slice complete"}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.data.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-border/80 bg-background/70 p-5 text-sm text-muted-foreground">
                    No tasks are in this tenant yet. Use the task workspace to
                    create the first one.
                  </div>
                ) : null}

                {tasks.data.map((task) => (
                  <div
                    className="flex flex-col gap-3 rounded-[24px] border border-border/80 bg-background/80 p-5 md:flex-row md:items-center md:justify-between"
                    key={task.id}
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">{task.title}</h2>
                        <Badge variant={statusBadgeVariant[task.status]}>
                          {formatTaskStatusLabel(task.status)}
                        </Badge>
                      </div>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {task.description || "No description provided yet."}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <CalendarClock className="h-4 w-4" />
                          {formatTaskDateTime(task.due_at)}
                        </span>
                        <span>{priorityTone[task.priority]}</span>
                      </div>
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

            <div className="space-y-4">
              <Card className="bg-white/85">
                <CardHeader>
                  <CardTitle>Focus areas</CardTitle>
                  <CardDescription>
                    What deserves attention before you drop into the full task
                    board.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-[24px] bg-background/75 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Overdue pressure
                    </p>
                    <p className="mt-3 text-3xl font-semibold">
                      {summary.overdue_task_count}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Tasks are already past due in this tenant.
                    </p>
                  </div>

                  <div className="rounded-[24px] bg-background/75 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Activity cadence
                    </p>
                    <p className="mt-3 text-3xl font-semibold">
                      {summary.recent_activity_count}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Audit events recorded over the last 7 days.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle>Workflow status</CardTitle>
                  <CardDescription className="text-primary-foreground/75">
                    The web app is now using the same backend contract across
                    overview, tasks, and exports.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-[24px] bg-white/10 p-4 text-sm">
                    Generated OpenAPI client + cookie-backed auth are already
                    powering this overview route.
                  </div>
                  <Button asChild className="w-full bg-white text-primary hover:bg-white/90">
                    <Link href="/tasks">Continue in task workspace</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default async function HomePage() {
  const session = await resolveServerSession();

  if (!session.accessToken) {
    return <PublicLanding />;
  }

  const state = await loadOverviewState(session.accessToken);

  if (state.kind === "error") {
    return <OverviewErrorState message={state.message} />;
  }

  return <SignedInOverview {...state} />;
}
