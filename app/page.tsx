import Link from "next/link";
import { ArrowRight, Layers3, ShieldCheck, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const pillars = [
  {
    icon: Layers3,
    title: "Tenant-aware by default",
    description:
      "Every task, audit entry, export, and dashboard view is scoped around the active tenant session.",
  },
  {
    icon: ShieldCheck,
    title: "Production contract first",
    description:
      "The web app is scaffolded around the synced OpenAPI file so generated clients can land without API drift.",
  },
  {
    icon: Smartphone,
    title: "Aligned with mobile",
    description:
      "The web and Flutter clients now start from the same checked-in REST contract and shared product behavior.",
  },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-hero-grid opacity-30 [background-size:42px_42px]" />
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-14 md:px-10">
        <div className="animate-fade-up space-y-8">
          <Badge className="w-fit" variant="warning">
            Next.js + Tailwind + shadcn/ui
          </Badge>

          <div className="max-w-4xl space-y-5">
            <h1 className="text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl">
              Fluxa web is ready to grow from API contract into an admin-grade
              control surface.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              The scaffold is intentionally shaped around the multi-tenant task
              platform: dashboard summary, task workflows, export jobs, and
              tenant switching are the first-class product paths.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/tasks">
                Explore task workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Open auth view</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/register">Create workspace</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-white/80 bg-white/80">
            <CardHeader>
              <CardTitle>Build order for the real app</CardTitle>
              <CardDescription>
                Web goes first, with the contract and design system already in
                place.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {pillars.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-border/80 bg-background/80 p-5"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-secondary p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold">{title}</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Immediate next slice</CardTitle>
              <CardDescription className="text-primary-foreground/75">
                Wire the synced OpenAPI contract into an API client layer and
                then hang auth plus task pages off of it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] bg-white/10 p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-primary-foreground/65">
                  First features
                </p>
                <ul className="mt-3 space-y-3 text-sm leading-7">
                  <li>Dashboard summary cards</li>
                  <li>Cookie-backed auth and tenant switching</li>
                  <li>Tenant switcher</li>
                  <li>Task list with filters and cursor pagination</li>
                  <li>Export job polling + result retrieval</li>
                </ul>
              </div>
              <Button asChild className="w-full bg-white text-primary hover:bg-white/90">
                <Link href="/tasks">Open starter workspace</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
