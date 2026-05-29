"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Banknote, CircleDollarSign, Clock3, Plus } from "lucide-react";
import { accountApi, authApi, transactionApi } from "@/lib/api";
import { formatCurrency, formatDate, shortId } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransferForm } from "@/components/forms/transfer-form";
import { SeedFundsForm } from "@/components/forms/seed-funds-form";
import { BalanceChart } from "@/components/charts/balance-chart";

export default function DashboardPage() {
  const userQuery = useQuery({ queryKey: ["auth", "me"], queryFn: async () => (await authApi.me()).user });
  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const isSystem = userQuery.data?.systemUser;
      if (isSystem) {
        return (await accountApi.all()).accounts || [];
      }
      return (await accountApi.list()).accounts || [];
    },
    enabled: !!userQuery.data,
  });
  const transactionsQuery = useQuery({
    queryKey: ["transactions", "dashboard"],
    queryFn: async () => (await transactionApi.list({ limit: 8 })).transactions || [],
  });

  const accounts = accountsQuery.data || [];
  const transactions = transactionsQuery.data || [];
  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  const activeAccounts = accounts.filter((account) => account.status === "ACTIVE").length;
  const hasAccounts = accounts.length > 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
      <section className="space-y-6">
        <Card className="overflow-hidden border-sky-400/10 bg-linear-to-br from-sky-400/10 via-white/5 to-emerald-400/10">
          <CardContent className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Badge tone="default">Welcome back</Badge>
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Total portfolio balance</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{formatCurrency(totalBalance)}</h1>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-slate-400">
                {userQuery.data?.name || "Your"} accounts are synced from the immutable ledger. Every transfer updates live balances through ledger entries, not mutable counters.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-105">
              <StatCard label="Accounts" value={`${accounts.length}`} icon={Banknote} />
              <StatCard label="Active" value={`${activeAccounts}`} icon={CircleDollarSign} />
              <StatCard label="Recent tx" value={`${transactions.length}`} icon={Clock3} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <BalanceChart accounts={accounts} transactions={transactions} />
          <div className="space-y-4">
            <TransferForm accounts={accounts} compact />
            {userQuery.data?.systemUser ? <SeedFundsForm accounts={accounts} /> : null}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Account cards</CardTitle>
              <CardDescription>Balances are computed live from the ledger for each wallet.</CardDescription>
            </div>
            <Link href="/accounts">
              <Button variant="secondary" size="sm">
                <Plus className="h-4 w-4" />
                New account
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {accounts.map((account) => {
                const statusTone = getAccountTone(account.status);

                return (
                <Link key={account._id} href={`/accounts/${account._id}`} className="group rounded-3xl border border-white/8 bg-white/3 p-5 transition hover:-translate-y-0.5 hover:border-sky-400/20 hover:bg-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{account.currency}</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{shortId(account._id)}</h3>
                    </div>
                    <Badge tone={statusTone}>{account.status}</Badge>
                  </div>
                  <p className="mt-6 text-3xl font-semibold text-slate-50">{formatCurrency(account.balance, account.currency)}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                    <span>Created {formatDate(account.createdAt)}</span>
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
                );
              })}

              {hasAccounts ? null : <EmptyCard title="No accounts yet" description="Create your first account to unlock transfers and live balances." />}
            </div>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent transactions</CardTitle>
              <CardDescription>Latest transfer activity from your wallet graph.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.length ? transactions.map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-4 py-3 transition hover:bg-white/5">
                <div>
                  <p className="text-sm font-medium text-slate-100">{shortId(transaction._id)}</p>
                  <p className="text-xs text-slate-400">{formatDate(transaction.createdAt)}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="text-sm font-semibold text-sky-200">{formatCurrency(transaction.amount)}</p>
                  <p className="text-xs text-slate-400">{transaction.status}</p>
                  {userQuery.data?.systemUser && transaction.status === 'COMPLETED' ? (
                    <button
                      className="text-rose-400 text-xs px-2 py-1 rounded bg-white/5"
                      onClick={async () => {
                        try {
                          await transactionApi.reverse(transaction._id);
                          // refresh lists
                          (await (await transactionApi.list({ limit: 8 })).transactions) &&
                            (await (await accountApi.all()).accounts);
                          // invalidate on client side by reloading the page
                          window.location.reload();
                        } catch (err) {
                          alert(err instanceof Error ? err.message : 'Reverse failed');
                        }
                      }}
                    >
                      Reverse
                    </button>
                  ) : null}
                </div>
              </div>
            )) : <EmptyCard title="No transactions yet" description="Once you transfer money, the latest activity will appear here." compact />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Live session</CardTitle>
              <CardDescription>Verified user profile from backend auth.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-white/8 bg-white/3 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Email</p>
              <p className="mt-1 text-sm text-white">{userQuery.data?.email || "Loading..."}</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/3 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Verification</p>
              <p className="mt-1 text-sm text-white">{userQuery.data?.isEmailVerified ? "Verified" : "Pending verification"}</p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: Readonly<{ label: string; value: string; icon: React.ComponentType<{ className?: string }> }>) {
  return (
    <div className="rounded-3xl border border-white/8 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
        <Icon className="h-4 w-4 text-sky-300" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function EmptyCard({ title, description, compact = false }: Readonly<{ title: string; description: string; compact?: boolean }>) {
  return (
    <div className={compact ? "rounded-2xl border border-dashed border-white/10 p-4" : "rounded-3xl border border-dashed border-white/10 p-6"}>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
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
