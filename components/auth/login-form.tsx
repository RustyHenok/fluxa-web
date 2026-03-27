"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFriendlyError(message: string) {
  if (!message) {
    return "Something went wrong while signing you in.";
  }

  return message;
}

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("owner@example.com");
  const [password, setPassword] = useState("supersecret123");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return EMAIL_REGEX.test(email) && password.length >= 8;
  }, [email, password]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setError("Enter a valid email and a password with at least 8 characters.");
      return;
    }

    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setError(getFriendlyError(body?.error?.message ?? ""));
        return;
      }

      window.location.assign("/tasks");
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Email</span>
        <Input
          autoComplete="email"
          name="email"
          placeholder="owner@example.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Password</span>
        <Input
          autoComplete="current-password"
          name="password"
          placeholder="supersecret123"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {error ? (
        <p className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          {error}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Signing in..." : "Sign in to Fluxa"}
      </Button>

      <p className="text-sm text-muted-foreground">
        Need a workspace?{" "}
        <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/register">
          Create one here
        </Link>
        .
      </p>
    </form>
  );
}
