import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { readServerSession } from "@/lib/auth/session";

export default async function RegisterPage() {
  const session = await readServerSession();

  if (session.accessToken) {
    redirect("/tasks");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md bg-white/85">
        <CardHeader>
          <CardTitle>Launch a new Fluxa workspace</CardTitle>
          <CardDescription>
            This flow issues the real backend session and drops you into the
            tenant-aware task workspace right away.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </main>
  );
}
