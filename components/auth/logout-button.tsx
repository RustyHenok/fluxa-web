"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

export function LogoutButton(props: ButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      {...props}
      disabled={isPending || props.disabled}
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/auth/logout", {
            method: "POST",
          });
          router.push("/login");
          router.refresh();
        });
      }}
    >
      {isPending ? "Signing out..." : props.children ?? "Sign out"}
    </Button>
  );
}
