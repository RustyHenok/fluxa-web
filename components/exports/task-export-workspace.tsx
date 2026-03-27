"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ArrowUpRight, Download, LoaderCircle, Search } from "lucide-react";

import type {
  ErrorEnvelope,
  ExportRequest,
  JobResponse,
  JobResultResponse,
  TaskExportJobResult,
  TaskPriority,
  TaskStatus,
  TenantMemberResponse,
} from "@/lib/api/types";
import { formatEventLabel } from "@/lib/tasks";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TASK_STATUSES: TaskStatus[] = ["open", "in_progress", "done", "archived"];
const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];
const POLL_INTERVAL_MS = 1500;

interface TaskExportWorkspaceProps {
  members: TenantMemberResponse[];
  tenantName: string;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function isTaskExportJobResult(value: JobResultResponse["result"]): value is TaskExportJobResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "task_count" in value &&
    "tasks" in value &&
    Array.isArray((value as TaskExportJobResult).tasks)
  );
}

function isErrorEnvelope(
  value: JobResponse | JobResultResponse | ErrorEnvelope | null,
): value is ErrorEnvelope {
  return typeof value === "object" && value !== null && "error" in value;
}

function labelize(value: string) {
  return value.replaceAll("_", " ");
}

export function TaskExportWorkspace({
  members,
  tenantName,
}: TaskExportWorkspaceProps) {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [job, setJob] = useState<JobResponse | null>(null);
  const [result, setResult] = useState<JobResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!job || (job.status !== "queued" && job.status !== "running")) {
      return;
    }

    let cancelled = false;
    let timer: number | null = null;

    const pollJob = async () => {
      const response = await fetch(`/api/jobs/${job.id}`, {
        cache: "no-store",
      });

      const body = (await response.json().catch(() => null)) as
        | JobResponse
        | ErrorEnvelope
        | null;

      if (cancelled) {
        return;
      }

      if (!response.ok || !body || isErrorEnvelope(body)) {
        setError(
          isErrorEnvelope(body)
            ? body.error.message
            : "Unable to refresh the export job right now.",
        );
        return;
      }

      setJob(body);

      if (body.status === "completed") {
        const resultResponse = await fetch(`/api/jobs/${body.id}/result`, {
          cache: "no-store",
        });

        const resultBody = (await resultResponse.json().catch(() => null)) as
          | JobResultResponse
          | ErrorEnvelope
          | null;

        if (cancelled) {
          return;
        }

        if (!resultResponse.ok || !resultBody || isErrorEnvelope(resultBody)) {
          setError(
            isErrorEnvelope(resultBody)
              ? resultBody.error.message
              : "The job completed, but the result could not be loaded.",
          );
          return;
        }

        setResult(resultBody);
        return;
      }

      if (body.status === "dead_letter") {
        setError(body.last_error ?? "The export job failed and moved to dead letter.");
        return;
      }

      timer = window.setTimeout(pollJob, POLL_INTERVAL_MS);
    };

    timer = window.setTimeout(pollJob, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [job]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setResult(null);

    const payload: ExportRequest = {
      q: query.trim() || undefined,
      status: (status || undefined) as TaskStatus | undefined,
      priority: (priority || undefined) as TaskPriority | undefined,
      assignee_id: assigneeId || undefined,
    };

    startTransition(async () => {
      const response = await fetch("/api/exports/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => null)) as
        | JobResponse
        | ErrorEnvelope
        | null;

      if (!response.ok || !body || isErrorEnvelope(body)) {
        setError(
          isErrorEnvelope(body)
            ? body.error.message
            : "Unable to create the export job right now.",
        );
        return;
      }

      setJob(body);
      setResult(null);
    });
  }

  const exportResult = result && isTaskExportJobResult(result.result) ? result.result : null;

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-11"
                placeholder={`Filter tasks inside ${tenantName}`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Status</span>
            <select
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Any status</option>
              {TASK_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {labelize(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Priority</span>
            <select
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="">Any priority</option>
              {TASK_PRIORITIES.map((option) => (
                <option key={option} value={option}>
                  {labelize(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Assignee</span>
            <select
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm"
              value={assigneeId}
              onChange={(event) => setAssigneeId(event.target.value)}
            >
              <option value="">Anyone</option>
              {members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.email} · {member.role}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <p className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {error}
          </p>
        ) : null}

        <Button className="w-full md:w-auto" disabled={isPending} type="submit">
          {isPending ? "Creating export..." : "Create export job"}
        </Button>
      </form>

      {job ? (
        <div className="rounded-[28px] border border-border/80 bg-background/80 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={job.status === "completed" ? "success" : "warning"}>
              {formatEventLabel(job.status)}
            </Badge>
            <span className="text-sm text-muted-foreground">Job ID: {job.id}</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-[20px] bg-white/80 p-4 text-sm text-muted-foreground">
              Scheduled {formatDateTime(job.scheduled_at)}
            </div>
            <div className="rounded-[20px] bg-white/80 p-4 text-sm text-muted-foreground">
              Attempts {job.attempts} / {job.max_attempts}
            </div>
          </div>
          {job.status === "queued" || job.status === "running" ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Polling export job status...
            </div>
          ) : null}
        </div>
      ) : null}

      {exportResult ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold tracking-[-0.03em]">
                Export result
              </h3>
              <p className="text-sm text-muted-foreground">
                Generated {formatDateTime(exportResult.generated_at)} with{" "}
                {exportResult.task_count} matching tasks.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
              <Download className="h-4 w-4" />
              JSON result contract loaded
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] border border-border/80 bg-background/80 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Task count
              </p>
              <p className="mt-3 text-3xl font-semibold">{exportResult.task_count}</p>
            </div>
            <div className="rounded-[24px] border border-border/80 bg-background/80 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Requested by
              </p>
              <p className="mt-3 break-all text-sm text-foreground">
                {exportResult.requested_by}
              </p>
            </div>
            <div className="rounded-[24px] border border-border/80 bg-background/80 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Finished at
              </p>
              <p className="mt-3 text-sm text-foreground">
                {formatDateTime(result?.finished_at ?? null)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {exportResult.tasks.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border/80 bg-background/70 p-5 text-sm text-muted-foreground">
                No tasks matched this export filter.
              </div>
            ) : null}

            {exportResult.tasks.map((task) => (
              <div
                className="flex flex-col gap-3 rounded-[24px] border border-border/80 bg-background/80 p-5 md:flex-row md:items-center md:justify-between"
                key={task.id}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-semibold">{task.title}</h4>
                    <Badge>{labelize(task.status)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {task.description || "No description"}
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
