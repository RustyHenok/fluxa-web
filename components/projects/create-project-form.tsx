"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateProjectForm() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setDescription("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Give the project a name before creating it.");
      return;
    }

    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const body = (await response.json().catch(() => null)) as
        | { id?: string; error?: { message?: string } }
        | null;

      if (!response.ok || !body?.id) {
        setError(body?.error?.message ?? "Unable to create the project right now.");
        return;
      }

      resetForm();
      window.location.assign(`/projects/${body.id}`);
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Project name</span>
        <Input
          placeholder="Platform rollout"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Description</span>
        <Textarea
          placeholder="Scope, owner, and delivery intent for this project."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      {error ? (
        <p className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          {error}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Creating project..." : "Create project"}
      </Button>
    </form>
  );
}
