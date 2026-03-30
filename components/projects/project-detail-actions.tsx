"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderX, LoaderCircle } from "lucide-react";

import type { ProjectResponse } from "@/lib/api/types";

import { Button } from "@/components/ui/button";

interface ProjectDetailActionsProps {
  project: ProjectResponse;
}

export function ProjectDetailActions({ project }: ProjectDetailActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function deleteProject() {
    if (
      !window.confirm(
        "Delete this project? Linked tasks stay in the system but lose their project assignment.",
      )
    ) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      const body = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!response.ok) {
        setError(body?.error?.message ?? "Unable to delete the project right now.");
        return;
      }

      window.location.assign("/projects");
    });
  }

  return (
    <div className="space-y-4">
      <Button
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        disabled={isPending}
        onClick={deleteProject}
        type="button"
      >
        {isPending ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FolderX className="mr-2 h-4 w-4" />
        )}
        Delete project
      </Button>

      {error ? (
        <p className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          {error}
        </p>
      ) : null}
    </div>
  );
}
