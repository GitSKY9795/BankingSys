"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, Plus } from "lucide-react";
import { accountApi } from "@/lib/api";
import { formatCurrency, formatDate, shortId } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const accountsQuery = useQuery({ queryKey: ["accounts"], queryFn: async () => (await accountApi.list()).accounts || [] });
  const [open, setOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: accountApi.create,
    onSuccess: async () => {
      toast.success("Account created successfully");
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setOpen(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const accounts = accountsQuery.data || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Your accounts</CardTitle>
            <CardDescription>Open multiple wallets and monitor live balances from the ledger.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Create account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new account</DialogTitle>
                <DialogDescription>A new account starts at zero balance and immediately becomes visible across the dashboard.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Button className="w-full" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                  Create account now
                </Button>
                <p className="text-center text-xs text-slate-400">No extra input is required. The backend assigns the wallet to your verified profile.</p>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((account) => {
          const statusTone = getAccountTone(account.status);

          return (
          <Link key={account._id} href={`/accounts/${account._id}`} className="group rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:-translate-y-0.5 hover:border-sky-400/20 hover:bg-white/5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-200 ring-1 ring-sky-400/15">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{account.currency}</p>
                  <h3 className="text-lg font-semibold text-white">{shortId(account._id)}</h3>
                </div>
              </div>
              <Badge tone={statusTone}>{account.status}</Badge>
            </div>
            <p className="mt-6 text-3xl font-semibold text-white">{formatCurrency(account.balance, account.currency)}</p>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
              <span>Created {formatDate(account.createdAt)}</span>
              <span className="transition group-hover:text-sky-200">Open details</span>
            </div>
          </Link>
          );
        })}
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg font-semibold text-white">No accounts yet</p>
            <p className="mt-2 text-sm text-slate-400">Create your first account to enable transfers, analytics, and ledger exploration.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function getAccountTone(status: string) {
  if (status === "ACTIVE") {
    return "success";
  }

  if (status === "FROZEN") {
    return "warning";
  }

  return "danger";
}
