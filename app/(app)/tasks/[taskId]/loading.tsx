import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TaskDetailLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-10">
      <Skeleton className="mb-6 h-10 w-40" />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card className="bg-white/85">
            <CardHeader className="space-y-4">
              <div className="flex gap-3">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-28 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full max-w-lg" />
              <Skeleton className="h-5 w-full max-w-xl" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardHeader className="space-y-3">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-5 w-full max-w-sm" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton className="h-32 w-full" key={index} />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="space-y-3">
              <Skeleton className="h-8 w-36 bg-white/15" />
              <Skeleton className="h-5 w-full bg-white/15" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full bg-white/15" />
              <Skeleton className="h-36 w-full bg-white/15" />
              <Skeleton className="h-24 w-full bg-white/15" />
              <Skeleton className="h-11 w-32 rounded-full bg-white/20" />
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardHeader className="space-y-3">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
