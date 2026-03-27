import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftRight, ChevronLeft, DownloadCloud, UsersRound } from "lucide-react";

import { TaskExportWorkspace } from "@/components/exports/task-export-workspace";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FluxaApiError, fluxaApi } from "@/lib/api/client";
import type { MeResponse, TenantMemberResponse } from "@/lib/api/types";
import { readServerSession } from "@/lib/auth/session";
import { getApiBaseUrl } from "@/lib/env";

interface ReadyExportsState {
  kind: "ready";
  me: MeResponse;
  members: TenantMemberResponse[];
}

interface ErrorExportsState {
  kind: "error";
  message: string;
}

type ExportsState = ReadyExportsState | ErrorExportsState;

async function loadExportsState(accessToken: string): Promise<ExportsState> {
  try {
    const me = await fluxaApi.getMe(accessToken);
    const members = await fluxaApi.listTenantMembers(
      accessToken,
      me.active_tenant.tenant_id,
    );

    return {
      kind: "ready",
      me,
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
          : "Unable to load the export workspace right now.",
    };
  }
}

export default async function ExportsPage() {
  const session = await readServerSession();

  if (!session.accessToken) {
    redirect("/login");
  }

  const state = await loadExportsState(session.accessToken);

  if (state.kind === "error") {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-12">
        <Card className="w-full bg-white/85">
          <CardHeader>
            <CardTitle>Export workspace is ready, but the API is unavailable</CardTitle>
            <CardDescription>
              The export UI is wired in, but the backend could not be reached
              for tenant context.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-[24px] border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
              {state.message}
            </p>
            <div className="rounded-[24px] border border-border/80 bg-background/80 p-4 text-sm text-muted-foreground">
              <p>Expected API base URL: {getApiBaseUrl()}</p>
            </div>
            <Button asChild>
              <Link href="/tasks">Back to tasks</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

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

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="h-fit bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>Task exports</CardTitle>
            <CardDescription className="text-primary-foreground/75">
              This flow uses the background-job contract already exposed by the
              backend: create export, poll status, then fetch the finalized
              result payload.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/65">
                Active tenant
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {state.me.active_tenant.tenant_name}
              </p>
              <p className="mt-2 text-sm text-primary-foreground/75">
                {state.me.active_tenant.role} access
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[24px] bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/65">
                  Members
                </p>
                <div className="mt-3 inline-flex items-center gap-2 text-sm">
                  <UsersRound className="h-4 w-4" />
                  {state.members.length} assignable users
                </div>
              </div>
              <div className="rounded-[24px] bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/65">
                  Export flow
                </p>
                <div className="mt-3 inline-flex items-center gap-2 text-sm">
                  <ArrowLeftRight className="h-4 w-4" />
                  Job polling + result retrieval
                </div>
              </div>
            </div>

            <Button asChild className="w-full bg-white text-primary hover:bg-white/90">
              <Link href="/tasks">
                <DownloadCloud className="mr-2 h-4 w-4" />
                Return to task workspace
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/85">
          <CardHeader>
            <CardTitle>Export builder</CardTitle>
            <CardDescription>
              Start a background export using tenant-scoped filters, then watch
              the result land in the same workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskExportWorkspace
              members={state.members}
              tenantName={state.me.active_tenant.tenant_name}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
