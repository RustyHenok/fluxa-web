import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md bg-white/85">
        <CardHeader className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    </main>
  );
}
