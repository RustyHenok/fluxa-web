import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExportsLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-10">
      <Skeleton className="mb-6 h-10 w-40" />

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="h-fit bg-primary text-primary-foreground">
          <CardHeader className="space-y-3">
            <Skeleton className="h-8 w-40 bg-white/15" />
            <Skeleton className="h-5 w-full bg-white/15" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-28 w-full bg-white/15" />
            <Skeleton className="h-24 w-full bg-white/15" />
            <Skeleton className="h-11 w-full rounded-full bg-white/20" />
          </CardContent>
        </Card>

        <Card className="bg-white/85">
          <CardHeader className="space-y-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-5 w-full max-w-lg" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-11 w-40 rounded-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
