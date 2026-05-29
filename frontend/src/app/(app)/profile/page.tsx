"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, LogOut, ShieldCheck, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { accountApi, authApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SeedFundsForm } from "@/components/forms/seed-funds-form";

export default function ProfilePage() {
  const router = useRouter();
  const userQuery = useQuery({ queryKey: ["auth", "me"], queryFn: async () => (await authApi.me()).user });
  const accountsQuery = useQuery({ queryKey: ["accounts"], queryFn: async () => (await accountApi.list()).accounts || [] });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      toast.success("Signed out successfully");
      router.push("/login");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const user = userQuery.data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Profile & settings</CardTitle>
            <CardDescription>View session details, verification status, and admin-only funding tools.</CardDescription>
          </div>
          <Button variant="secondary" onClick={() => logoutMutation.mutate()}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-200 ring-1 ring-sky-400/15">
                <UserCircle2 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">User</p>
                <h2 className="text-2xl font-semibold text-white">{user?.name || "Loading..."}</h2>
              </div>
            </div>

            <div className="space-y-3 rounded-3xl border border-white/8 bg-white/4 p-5">
              <InfoRow label="Email" value={user?.email || "—"} />
              <InfoRow label="Verification" value={user?.isEmailVerified ? "Verified" : "Pending"} />
              <InfoRow label="Role" value={user?.systemUser ? "System user" : "Standard user"} />
              <InfoRow label="Accounts" value={`${accountsQuery.data?.length || 0}`} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge tone={user?.isEmailVerified ? "success" : "warning"}>{user?.isEmailVerified ? "Email verified" : "Verification needed"}</Badge>
              <Badge tone={user?.systemUser ? "success" : "muted"}>{user?.systemUser ? "Admin access" : "Customer access"}</Badge>
            </div>

            {user?.isEmailVerified ? null : (
              <Button asChild variant="secondary" className="w-full">
                <Link href={`/verify-email?email=${encodeURIComponent(user?.email || "")}`}>
                  Verify email now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {user?.systemUser ? <SeedFundsForm accounts={accountsQuery.data || []} /> : null}

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Security notes</CardTitle>
                <CardDescription>Backend JWTs are stored as HttpOnly cookies and forwarded by the frontend proxy.</CardDescription>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
            </CardHeader>
            <CardContent className="text-sm leading-7 text-slate-400">
              <p>• Logged in users can open multiple accounts, move funds between them, and export transaction history.</p>
              <p>• Admin users can seed demo balances through the system-only funding endpoint.</p>
              <p>• All ledger views are read-only and backed by immutable entries from the server.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 py-3 last:border-b-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}
