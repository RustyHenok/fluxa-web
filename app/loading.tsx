import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-14 md:px-10">
      <div className="space-y-8">
        <Skeleton className="h-8 w-40" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-full max-w-4xl" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-white/80 bg-white/80">
            <CardHeader className="space-y-3">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-5 w-80" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  className="rounded-[24px] border border-border/80 bg-background/80 p-5"
                  key={index}
                >
                  <Skeleton className="mb-4 h-11 w-11 rounded-2xl" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="mt-3 h-16 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="space-y-3">
              <Skeleton className="h-8 w-48 bg-white/15" />
              <Skeleton className="h-5 w-full bg-white/15" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-40 w-full bg-white/15" />
              <Skeleton className="h-11 w-full rounded-full bg-white/20" />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
