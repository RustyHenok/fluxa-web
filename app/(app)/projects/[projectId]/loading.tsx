import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-10">
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Card className="bg-white/85">
              <CardHeader className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-12 w-80" />
                <Skeleton className="h-5 w-full max-w-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card className="bg-white/85" key={index}>
                  <CardHeader className="space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-20" />
                  </CardHeader>
                </Card>
              ))}
            </section>
          </div>

          <div className="space-y-6">
            <Card className="bg-primary text-primary-foreground">
              <CardHeader className="space-y-3">
                <Skeleton className="h-8 w-40 bg-white/15" />
                <Skeleton className="h-5 w-full bg-white/15" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full bg-white/15" />
                <Skeleton className="h-24 w-full bg-white/15" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
