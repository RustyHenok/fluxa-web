"use client";

import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

export function LogoutButton(props: ButtonProps) {
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      {...props}
      disabled={isPending || props.disabled}
      onClick={async () => {
        setIsPending(true);

        try {
          await fetch("/api/auth/logout", {
            method: "POST",
          });
          window.location.assign("/");
        } finally {
          setIsPending(false);
        }
      }}
    >
      {isPending ? "Signing out..." : props.children ?? "Sign out"}
    </Button>
  );
}
