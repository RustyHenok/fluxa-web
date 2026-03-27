"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { TenantMembershipResponse } from "@/lib/api/types";

import { Button } from "@/components/ui/button";

interface TenantSwitcherProps {
  activeTenantId: string;
  tenants: TenantMembershipResponse[];
}

export function TenantSwitcher({
  activeTenantId,
  tenants,
}: TenantSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTenant, setSelectedTenant] = useState(activeTenantId);
  const [error, setError] = useState<string | null>(null);

  async function handleSwitch() {
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/switch-tenant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenant_id: selectedTenant }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setError(body?.error?.message ?? "Unable to switch tenant right now.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.18em] text-primary-foreground/65">
          Active tenant
        </span>
        <select
          className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-primary-foreground outline-none"
          value={selectedTenant}
          onChange={(event) => setSelectedTenant(event.target.value)}
        >
          {tenants.map((tenant) => (
            <option className="text-foreground" key={tenant.tenant_id} value={tenant.tenant_id}>
              {tenant.tenant_name} · {tenant.role}
            </option>
          ))}
        </select>
      </label>
      <Button
        className="w-full justify-between"
        disabled={isPending || selectedTenant === activeTenantId}
        variant="secondary"
        onClick={handleSwitch}
      >
        {isPending ? "Switching..." : "Switch tenant"}
      </Button>
      {error ? (
        <p className="text-sm text-warning">{error}</p>
      ) : null}
    </div>
  );
}
