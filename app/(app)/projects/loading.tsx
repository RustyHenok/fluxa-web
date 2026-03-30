import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-10">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit bg-primary text-primary-foreground">
          <CardHeader className="space-y-3">
            <Skeleton className="h-8 w-44 bg-white/15" />
            <Skeleton className="h-5 w-full bg-white/15" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full bg-white/15" />
            <Skeleton className="h-32 w-full bg-white/15" />
            <Skeleton className="h-20 w-full bg-white/15" />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-12 w-80" />
            <Skeleton className="h-5 w-full max-w-2xl" />
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card className="bg-white/80" key={index}>
                <CardHeader className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-28" />
                </CardHeader>
              </Card>
            ))}
          </section>

          <Card className="bg-white/85">
            <CardHeader className="space-y-3">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-5 w-full max-w-lg" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
