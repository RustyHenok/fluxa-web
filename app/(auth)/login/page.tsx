import { LockKeyhole, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md bg-white/85">
        <CardHeader>
          <CardTitle>Welcome back to Fluxa</CardTitle>
          <CardDescription>
            This placeholder screen is ready to be wired to the backend auth
            session flow and tenant switching.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <div className="flex h-12 items-center rounded-2xl border border-input bg-background px-4">
              <Mail className="mr-3 h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                owner@example.com
              </span>
            </div>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Password</span>
            <div className="flex h-12 items-center rounded-2xl border border-input bg-background px-4">
              <LockKeyhole className="mr-3 h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">••••••••••••</span>
            </div>
          </label>
          <Button className="w-full">Connect auth handler</Button>
        </CardContent>
      </Card>
    </main>
  );
}
