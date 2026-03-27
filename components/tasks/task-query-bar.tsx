"use client";

import { useState, useTransition } from "react";
import { Filter, LoaderCircle, Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import type {
  ListTasksQuery,
  TaskPriority,
  TaskStatus,
  TenantMemberResponse,
} from "@/lib/api/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_TASK_PAGE_SIZE } from "@/lib/tasks";

const TASK_STATUSES: Array<{ label: string; value: TaskStatus }> = [
  { label: "Open", value: "open" },
  { label: "In progress", value: "in_progress" },
  { label: "Done", value: "done" },
  { label: "Archived", value: "archived" },
];

const TASK_PRIORITIES: Array<{ label: string; value: TaskPriority }> = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

interface TaskQueryBarProps {
  currentCount: number;
  initialQuery: ListTasksQuery;
  members: TenantMemberResponse[];
  nextCursor: string | null;
}

function buildQueryString({
  assigneeId,
  cursor,
  limit,
  priority,
  q,
  status,
}: {
  assigneeId: string;
  cursor?: string | null;
  limit: string;
  priority: string;
  q: string;
  status: string;
}) {
  const params = new URLSearchParams();

  if (q.trim()) {
    params.set("q", q.trim());
  }

  if (status) {
    params.set("status", status);
  }

  if (priority) {
    params.set("priority", priority);
  }

  if (assigneeId) {
    params.set("assignee_id", assigneeId);
  }

  if (limit && limit !== String(DEFAULT_TASK_PAGE_SIZE)) {
    params.set("limit", limit);
  }

  if (cursor) {
    params.set("cursor", cursor);
  }

  return params.toString();
}

export function TaskQueryBar({
  currentCount,
  initialQuery,
  members,
  nextCursor,
}: TaskQueryBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialQuery.q ?? "");
  const [status, setStatus] = useState(initialQuery.status ?? "");
  const [priority, setPriority] = useState(initialQuery.priority ?? "");
  const [assigneeId, setAssigneeId] = useState(initialQuery.assignee_id ?? "");
  const [limit, setLimit] = useState(
    String(initialQuery.limit ?? DEFAULT_TASK_PAGE_SIZE),
  );

  const activeFilterCount = [
    search.trim(),
    status,
    priority,
    assigneeId,
  ].filter(Boolean).length;

  function navigate(nextQuery: string) {
    startTransition(() => {
      router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    });
  }

  function handleApply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    navigate(
      buildQueryString({
        assigneeId,
        limit,
        priority,
        q: search,
        status,
      }),
    );
  }

  function handleClear() {
    setSearch("");
    setStatus("");
    setPriority("");
    setAssigneeId("");
    setLimit(String(DEFAULT_TASK_PAGE_SIZE));
    navigate("");
  }

  function handleLoadMore() {
    if (!nextCursor) {
      return;
    }

    navigate(
      buildQueryString({
        assigneeId,
        cursor: nextCursor,
        limit,
        priority,
        q: search,
        status,
      }),
    );
  }

  return (
    <div className="space-y-4">
      <form className="space-y-4" onSubmit={handleApply}>
        <div className="grid gap-3 xl:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Search
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-11"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search task titles and descriptions"
                value={search}
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Status
            </span>
            <select
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option value="">All statuses</option>
              {TASK_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Priority
            </span>
            <select
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onChange={(event) => setPriority(event.target.value)}
              value={priority}
            >
              <option value="">All priorities</option>
              {TASK_PRIORITIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Assignee
            </span>
            <select
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onChange={(event) => setAssigneeId(event.target.value)}
              value={assigneeId}
            >
              <option value="">Anyone</option>
              {members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.email}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Page size
            </span>
            <select
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onChange={(event) => setLimit(event.target.value)}
              value={limit}
            >
              {[6, 9, 12, 18].map((option) => (
                <option key={option} value={option}>
                  {option} tasks
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-2">
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0
                ? `${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}`
                : "No active filters"}
            </span>
            <span>{currentCount} tasks in this slice</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              disabled={isPending}
              onClick={handleClear}
              type="button"
              variant="ghost"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button disabled={isPending} type="submit" variant="outline">
              {isPending ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Filter className="mr-2 h-4 w-4" />
                  Apply filters
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {nextCursor ? (
        <div className="flex justify-end">
          <Button disabled={isPending} onClick={handleLoadMore} variant="outline">
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Loading next page...
              </>
            ) : (
              "Load next page"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
