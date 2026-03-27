import { ArrowUpRight, CalendarClock, Filter, Layers3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const metrics = [
  { label: "Open", value: "18", tone: "default" as const },
  { label: "In Progress", value: "7", tone: "warning" as const },
  { label: "Done", value: "42", tone: "success" as const },
];

const tasks = [
  {
    title: "Wire dashboard summary endpoint",
    status: "In Progress",
    due: "Today, 17:30",
  },
  {
    title: "Generate typed web API client",
    status: "Planned",
    due: "Tomorrow, 10:00",
  },
  {
    title: "Add export result drawer",
    status: "Blocked",
    due: "Mar 31, 14:00",
  },
];

export default function TasksPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-10">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>Fluxa Workspace</CardTitle>
            <CardDescription className="text-primary-foreground/75">
              Tailwind and shadcn primitives are in place for the real app shell.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/65">
                Active tenant
              </p>
              <p className="mt-3 text-2xl font-semibold">Acme Ops</p>
            </div>
            <Button variant="secondary" className="w-full justify-between">
              Switch tenant
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge className="mb-3 w-fit">Starter task workspace</Badge>
              <h1 className="text-4xl font-semibold tracking-[-0.04em]">
                Contract-aware task dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                This page is the first landing zone for the live dashboard
                summary, task list filters, and export job polling flows.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button>Create task</Button>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            {metrics.map((metric) => (
              <Card key={metric.label} className="bg-white/80">
                <CardHeader className="pb-3">
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="text-4xl">{metric.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={metric.tone}>
                    synced from dashboard summary
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </section>

          <Card className="bg-white/85">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Task feed</CardTitle>
                <CardDescription>
                  Placeholder content for the real cursor-paginated task table.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Layers3 className="h-4 w-4" />
                Synced OpenAPI contract ready
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.title}
                  className="flex flex-col gap-3 rounded-[24px] border border-border/80 bg-background/80 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h2 className="text-lg font-semibold">{task.title}</h2>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarClock className="h-4 w-4" />
                      {task.due}
                    </div>
                  </div>
                  <Badge>{task.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
