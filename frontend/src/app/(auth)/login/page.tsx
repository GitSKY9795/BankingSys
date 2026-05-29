"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { loginSchema } from "@/lib/validators";
import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      toast.success("Welcome back to Ledgered");
      router.replace("/dashboard");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AuthShell
      eyebrow="Secure access"
      title="Sign in to your banking workspace"
      description="Use your verified email and password to access balances, transfers, the immutable ledger, and admin operations."
    >
      <form
        className="space-y-5"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-sm font-medium text-slate-200">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input id="login-email" className="pl-11" type="email" placeholder="name@company.com" {...form.register("email")} />
          </div>
          {form.formState.errors.email ? <p className="text-sm text-rose-300">{form.formState.errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="login-password" className="text-sm font-medium text-slate-200">Password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input id="login-password" className="pl-11" type="password" placeholder="••••••••" {...form.register("password")} />
          </div>
          {form.formState.errors.password ? <p className="text-sm text-rose-300">{form.formState.errors.password.message}</p> : null}
        </div>

        <Button className="w-full" size="lg" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Sign in
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
        <Link href="/register" className="transition hover:text-sky-200">Create a new account</Link>
        <div className="flex gap-4">
          <Link href="/verify-email" className="transition hover:text-sky-200">Verify email</Link>
          <Link href="/reset-password" className="transition hover:text-sky-200">Forgot password?</Link>
        </div>
      </div>
    </AuthShell>
  );
}
