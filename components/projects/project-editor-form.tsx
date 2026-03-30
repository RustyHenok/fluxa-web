"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { ProjectResponse } from "@/lib/api/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProjectEditorFormProps {
  project: ProjectResponse;
}

export function ProjectEditorForm({ project }: ProjectEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("The project still needs a name.");
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const body = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!response.ok) {
        setError(body?.error?.message ?? "Unable to update the project right now.");
        return;
      }

      setSuccess("Project updated.");
      router.refresh();
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Project name</span>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Description</span>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

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
