"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, LockKeyhole, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { registerSchema } from "@/lib/validators";
import type { z } from "zod";

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (_data, values) => {
      toast.success("Account created. Check your inbox for the OTP.");
      const query = new URLSearchParams({ email: values.email });
      router.push(`/verify-email?${query.toString()}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AuthShell
      eyebrow="Get started"
      title="Open a Ledgered account"
      description="Create your profile, verify your email, and unlock live balances, transfers, and the immutable ledger."
    >
      <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="space-y-2">
          <label htmlFor="register-name" className="text-sm font-medium text-slate-200">Full name</label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input id="register-name" className="pl-11" placeholder="Avery Chen" {...form.register("name")} />
          </div>
          {form.formState.errors.name ? <p className="text-sm text-rose-300">{form.formState.errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="register-email" className="text-sm font-medium text-slate-200">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input id="register-email" className="pl-11" type="email" placeholder="name@company.com" {...form.register("email")} />
          </div>
          {form.formState.errors.email ? <p className="text-sm text-rose-300">{form.formState.errors.email.message}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="register-password" className="text-sm font-medium text-slate-200">Password</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input id="register-password" className="pl-11" type="password" placeholder="Minimum 6 characters" {...form.register("password")} />
            </div>
            {form.formState.errors.password ? <p className="text-sm text-rose-300">{form.formState.errors.password.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="register-confirm-password" className="text-sm font-medium text-slate-200">Confirm password</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input id="register-confirm-password" className="pl-11" type="password" placeholder="Repeat password" {...form.register("confirmPassword")} />
            </div>
            {form.formState.errors.confirmPassword ? <p className="text-sm text-rose-300">{form.formState.errors.confirmPassword.message}</p> : null}
          </div>
        </div>

        <Button className="w-full" size="lg" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Create account
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        Already registered? <Link href="/login" className="text-sky-200 transition hover:text-sky-100">Sign in</Link>
      </div>
    </AuthShell>
  );
}
