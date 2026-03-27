import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
