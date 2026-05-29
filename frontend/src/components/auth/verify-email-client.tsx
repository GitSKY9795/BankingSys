"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { resendSchema, verifySchema } from "@/lib/validators";
import type { z } from "zod";

type VerifyValues = z.infer<typeof verifySchema>;
type ResendValues = z.infer<typeof resendSchema>;

export function VerifyEmailClient({ initialEmail, initialOtp }: Readonly<{ initialEmail: string; initialOtp: string }>) {
  const verifyForm = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { email: initialEmail, otp: initialOtp },
  });

  const resendForm = useForm<ResendValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: { email: initialEmail },
  });

  useEffect(() => {
    if (initialEmail) {
      verifyForm.setValue("email", initialEmail);
      resendForm.setValue("email", initialEmail);
    }
    if (initialOtp) {
      verifyForm.setValue("otp", initialOtp);
    }
  }, [initialEmail, initialOtp, resendForm, verifyForm]);

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      toast.success("Email verified. You can sign in now.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const resendMutation = useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => toast.success("A fresh verification code has been sent."),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AuthShell
      eyebrow="Verification"
      title="Verify your email address"
      description="Enter the six-digit code we sent to your inbox. If it expired or never arrived, request a new one without leaving the page."
    >
      <div className="space-y-6">
        <form className="space-y-5" onSubmit={verifyForm.handleSubmit((values) => verifyMutation.mutate(values))}>
          <div className="space-y-2">
            <label htmlFor="verify-email" className="text-sm font-medium text-slate-200">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input id="verify-email" className="pl-11" type="email" placeholder="name@company.com" {...verifyForm.register("email")} />
            </div>
            {verifyForm.formState.errors.email ? <p className="text-sm text-rose-300">{verifyForm.formState.errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="verify-otp" className="text-sm font-medium text-slate-200">Verification code</label>
            <div className="relative">
              <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input id="verify-otp" className="pl-11 tracking-[0.4em]" inputMode="numeric" placeholder="000000" {...verifyForm.register("otp")} />
            </div>
            {verifyForm.formState.errors.otp ? <p className="text-sm text-rose-300">{verifyForm.formState.errors.otp.message}</p> : null}
          </div>

          <Button className="w-full" size="lg" type="submit" disabled={verifyMutation.isPending}>
            {verifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Verify email
          </Button>
        </form>

        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={resendForm.handleSubmit((values) => resendMutation.mutate(values))}>
          <Input className="flex-1" type="email" placeholder="email for resend" {...resendForm.register("email")} />
          <Button variant="secondary" type="submit" disabled={resendMutation.isPending}>
            {resendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Resend code
          </Button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Back to <Link href="/login" className="text-sky-200 transition hover:text-sky-100">sign in</Link> or create a new <Link href="/register" className="text-sky-200 transition hover:text-sky-100">account</Link>.
        </p>
      </div>
    </AuthShell>
  );
}