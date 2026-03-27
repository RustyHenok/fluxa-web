"use client";

import { useEffect } from "react";

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

async function refreshSessionSilently() {
  try {
    await fetch("/api/auth/refresh", {
      method: "POST",
      cache: "no-store",
    });
  } catch {
    // Session refresh is best-effort in the browser. Route handlers and proxy
    // still recover server-side when possible.
  }
}

export function SessionKeepAlive() {
  useEffect(() => {
    const onFocus = () => {
      void refreshSessionSilently();
    };

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshSessionSilently();
      }
    }, REFRESH_INTERVAL_MS);

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  return null;
}
