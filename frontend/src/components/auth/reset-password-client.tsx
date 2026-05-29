"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, ShieldCheck, Key } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { z } from "zod";

const emailSchema = z.string().regex(/^\S+@\S+\.\S+$/, "Enter a valid email address");
const requestSchema = z.object({ email: emailSchema });
const resetSchema = z
  .object({
    email: emailSchema,
    otp: z.string().regex(/^\d{4,8}$/, "Enter the verification code from your inbox"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

type RequestValues = z.infer<typeof requestSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export function ResetPasswordClient({ initialEmail }: Readonly<{ initialEmail?: string }>) {
  const router = useRouter();
  const reqForm = useForm<RequestValues>({ resolver: zodResolver(requestSchema), defaultValues: { email: initialEmail || "" } });
  const resetForm = useForm<ResetValues>({ resolver: zodResolver(resetSchema), defaultValues: { email: initialEmail || "", otp: "", newPassword: "", confirmPassword: "" } });

  useEffect(() => {
    if (initialEmail) {
      reqForm.setValue("email", initialEmail);
      resetForm.setValue("email", initialEmail);
    }
  }, [initialEmail, reqForm, resetForm]);

  const requestMutation = useMutation({
    mutationFn: authApi.requestPasswordReset,
    onSuccess: (_, variables) => {
      resetForm.setValue("email", variables.email);
      toast.success("If that email exists, a reset code was sent.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const resetMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success("Password updated. You can sign in now.");
      router.replace("/login");
      router.refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AuthShell eyebrow="Password" title="Reset your password" description="Request a code to your email, then enter the code and a new password below.">
      <div className="space-y-6">
        <form className="space-y-5" onSubmit={reqForm.handleSubmit((v) => requestMutation.mutate(v))}>
          <div className="space-y-2">
            <label htmlFor="rp-email" className="text-sm font-medium text-slate-200">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input id="rp-email" className="pl-11" type="email" placeholder="name@company.com" {...reqForm.register("email")} />
            </div>
            {reqForm.formState.errors.email ? <p className="text-sm text-rose-300">{reqForm.formState.errors.email.message}</p> : null}
          </div>

          <Button className="w-full" size="lg" type="submit" disabled={requestMutation.isPending}>
            {requestMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send reset code
          </Button>
        </form>

        <form className="space-y-5" onSubmit={resetForm.handleSubmit((v) => resetMutation.mutate({ email: v.email, otp: v.otp, newPassword: v.newPassword }))}>
          <div className="space-y-2">
            <label htmlFor="rp-otp" className="text-sm font-medium text-slate-200">Verification code</label>
            <div className="relative">
              <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input id="rp-otp" className="pl-11 tracking-[0.4em]" inputMode="numeric" placeholder="000000" {...resetForm.register("otp")} />
            </div>
            {resetForm.formState.errors.otp ? <p className="text-sm text-rose-300">{resetForm.formState.errors.otp.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="rp-password" className="text-sm font-medium text-slate-200">New password</label>
            <div className="relative">
              <Key className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input id="rp-password" className="pl-11" type="password" placeholder="New password" {...resetForm.register("newPassword")} />
            </div>
            {resetForm.formState.errors.newPassword ? <p className="text-sm text-rose-300">{resetForm.formState.errors.newPassword.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="rp-confirm" className="text-sm font-medium text-slate-200">Confirm password</label>
            <Input id="rp-confirm" type="password" placeholder="Confirm password" {...resetForm.register("confirmPassword")} />
            {resetForm.formState.errors.confirmPassword ? <p className="text-sm text-rose-300">{resetForm.formState.errors.confirmPassword.message}</p> : null}
          </div>

          <Button className="w-full" size="lg" type="submit" disabled={resetMutation.isPending}>
            {resetMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Reset password
          </Button>
        </form>

      </div>
    </AuthShell>
  );
}
