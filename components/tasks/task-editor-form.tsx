"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type {
  ProjectResponse,
  TaskPatchPayload,
  TaskPriority,
  TaskResponse,
  TaskStatus,
  TenantMemberResponse,
} from "@/lib/api/types";
import { toDatetimeLocalValue, toIsoDateTimeOrNull } from "@/lib/tasks";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const TASK_STATUSES: TaskStatus[] = ["open", "in_progress", "done", "archived"];
const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

interface TaskEditorFormProps {
  members: TenantMemberResponse[];
  projects: ProjectResponse[];
  task: TaskResponse;
}

function labelize(value: string) {
  return value.replaceAll("_", " ");
}

export function TaskEditorForm({
  members,
  projects,
  task,
}: TaskEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [projectId, setProjectId] = useState(task.project_id ?? "");
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assignee_id ?? "");
  const [dueAt, setDueAt] = useState(toDatetimeLocalValue(task.due_at));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("The task still needs a title.");
      return;
    }

    setError(null);
    setSuccess(null);

    const payload: TaskPatchPayload = {
      project_id: projectId || null,
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      assignee_id: assigneeId || null,
      due_at: toIsoDateTimeOrNull(dueAt),
    };

    startTransition(async () => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!response.ok) {
        setError(body?.error?.message ?? "Unable to update the task right now.");
        return;
      }

      setSuccess("Task updated.");
      router.refresh();
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Title</span>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Description</span>
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Project</span>
          <select
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>

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

      {success ? (
        <p className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {success}
        </p>
      ) : null}

      <Button disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
