"use client";

import { useState, useTransition } from "react";

import type {
  TaskPayload,
  TaskPriority,
  TaskStatus,
  TenantMemberResponse,
} from "@/lib/api/types";
import { toIsoDateTimeOrNull } from "@/lib/tasks";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const TASK_STATUSES: TaskStatus[] = ["open", "in_progress", "done", "archived"];
const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

interface CreateTaskFormProps {
  members: TenantMemberResponse[];
}

function labelize(value: string) {
  return value.replaceAll("_", " ");
}

export function CreateTaskForm({ members }: CreateTaskFormProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("open");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setTitle("");
    setDescription("");
    setStatus("open");
    setPriority("medium");
    setAssigneeId("");
    setDueAt("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Give the task a title before creating it.");
      return;
    }

    setError(null);

    const payload: TaskPayload = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      assignee_id: assigneeId || null,
      due_at: toIsoDateTimeOrNull(dueAt),
    };

    startTransition(async () => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => null)) as
        | { id?: string; error?: { message?: string } }
        | null;

      if (!response.ok || !body?.id) {
        setError(body?.error?.message ?? "Unable to create the task right now.");
        return;
      }

      resetForm();
      window.location.assign(`/tasks/${body.id}`);
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Title</span>
        <Input
          placeholder="Wire export polling for finance tenant"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Description</span>
        <Textarea
          placeholder="Capture the work, risk, and expected outcome."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Status</span>
          <select
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm"
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
          >
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
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
          >
            {TASK_PRIORITIES.map((option) => (
              <option key={option} value={option}>
                {labelize(option)}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Assignee</span>
          <select
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm"
            value={assigneeId}
            onChange={(event) => setAssigneeId(event.target.value)}
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.user_id} value={member.user_id}>
                {member.email} · {member.role}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Due at</span>
          <Input
            type="datetime-local"
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
          />
        </label>
      </div>

      {error ? (
        <p className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          {error}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Creating task..." : "Create task"}
      </Button>
    </form>
  );
}
