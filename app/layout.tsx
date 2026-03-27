import type { Metadata } from "next";

import { SessionKeepAlive } from "@/components/auth/session-keepalive";

import "./globals.css";

export const metadata: Metadata = {
  title: "Fluxa Web",
  description: "Tailwind + shadcn Next.js workspace for the Fluxa task platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionKeepAlive />
        {children}
      </body>
    </html>
  );
}
