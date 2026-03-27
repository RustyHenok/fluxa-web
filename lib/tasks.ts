import type { ListTasksQuery, TaskPriority, TaskStatus } from "@/lib/api/types";

export const DEFAULT_TASK_PAGE_SIZE = 6;

const TASK_STATUSES: TaskStatus[] = ["open", "in_progress", "done", "archived"];
const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

export function toDatetimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - timezoneOffset * 60_000);
  return adjusted.toISOString().slice(0, 16);
}

export function toIsoDateTimeOrNull(value: string) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

export function formatEventLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (segment) => segment.toUpperCase());
}

export function formatTaskDateTime(value: string | null) {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatTaskStatusLabel(value: TaskStatus) {
  return value.replaceAll("_", " ");
}

export function formatTaskPriorityLabel(value: TaskPriority) {
  return value.replaceAll("_", " ");
}

function isValidDateTimeValue(value: string | undefined) {
  return Boolean(value && !Number.isNaN(Date.parse(value)));
}

export function parseTaskListQuery(
  raw: Record<string, string | string[] | undefined>,
): ListTasksQuery {
  const query: ListTasksQuery = {
    limit: DEFAULT_TASK_PAGE_SIZE,
  };

  const pick = (key: keyof typeof raw) => {
    const value = raw[key];

    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  };

  const q = pick("q")?.trim();
  const status = pick("status");
  const priority = pick("priority");
  const assigneeId = pick("assignee_id")?.trim();
  const cursor = pick("cursor")?.trim();
  const dueBefore = pick("due_before")?.trim();
  const dueAfter = pick("due_after")?.trim();
  const updatedAfter = pick("updated_after")?.trim();
  const limitValue = Number(pick("limit"));

  if (q) {
    query.q = q;
  }

  if (status && TASK_STATUSES.includes(status as TaskStatus)) {
    query.status = status as TaskStatus;
  }

  if (priority && TASK_PRIORITIES.includes(priority as TaskPriority)) {
    query.priority = priority as TaskPriority;
  }

  if (assigneeId) {
    query.assignee_id = assigneeId;
  }

  if (cursor) {
    query.cursor = cursor;
  }

  if (isValidDateTimeValue(dueBefore)) {
    query.due_before = dueBefore;
  }

  if (isValidDateTimeValue(dueAfter)) {
    query.due_after = dueAfter;
  }

  if (isValidDateTimeValue(updatedAfter)) {
    query.updated_after = updatedAfter;
  }

  if (Number.isFinite(limitValue) && limitValue > 0) {
    query.limit = Math.min(Math.trunc(limitValue), 24);
  }

  return query;
}

export function countTaskFilters(query: ListTasksQuery) {
  return [
    query.q,
    query.status,
    query.priority,
    query.assignee_id,
    query.due_before,
    query.due_after,
    query.updated_after,
  ].filter(Boolean).length;
}
