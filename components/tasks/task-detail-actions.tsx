"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Archive, LoaderCircle, Trash2 } from "lucide-react";

import type { TaskResponse } from "@/lib/api/types";

import { Button } from "@/components/ui/button";

interface TaskDetailActionsProps {
  task: TaskResponse;
}

export function TaskDetailActions({ task }: TaskDetailActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function archiveTask() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "archived" }),
      });

      const body = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!response.ok) {
        setError(body?.error?.message ?? "Unable to archive the task right now.");
        return;
      }

      setSuccess("Task archived.");
      router.refresh();
    });
  }

  function deleteTask() {
    if (!window.confirm("Delete this task permanently? This action cannot be undone.")) {
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      const body = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!response.ok) {
        setError(body?.error?.message ?? "Unable to delete the task right now.");
        return;
      }

      window.location.assign("/tasks");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={isPending || task.status === "archived"}
          onClick={archiveTask}
          type="button"
          variant="outline"
        >
          {isPending ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Archive className="mr-2 h-4 w-4" />
          )}
          {task.status === "archived" ? "Already archived" : "Archive task"}
        </Button>

        <Button
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          disabled={isPending}
          onClick={deleteTask}
          type="button"
        >
          {isPending ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Delete task
        </Button>
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
    </div>
  );
}
