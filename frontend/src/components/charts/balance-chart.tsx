"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatRelativeDay } from "@/lib/format";
import type { Account, Transaction } from "@/lib/types";

export function BalanceChart(props: { readonly accounts: Account[]; readonly transactions?: Transaction[] }) {
  const { accounts, transactions } = props;
  const maxBalance = Math.max(1, ...accounts.map((account) => account.balance || 0));
  const recentTransactions = (transactions || []).slice(-12);
  const maxTransactionAmount = Math.max(1, ...recentTransactions.map((transaction) => transaction.amount || 0));

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Balance visibility</CardTitle>
          <CardDescription>Live account balances and recent transfer activity.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-3xl border border-white/8 bg-slate-950/50 p-4">
          <div className="flex h-64 items-end gap-3">
            {accounts.map((account) => {
              const barHeight = (account.balance / maxBalance) * 100;
              return (
                <div key={account._id} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-2xl bg-linear-to-t from-sky-500 via-sky-400 to-cyan-200 shadow-lg shadow-sky-400/20"
                      style={{ height: `${Math.max(8, barHeight)}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">{account._id.slice(-4)}</p>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{formatCurrency(account.balance, account.currency)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {recentTransactions.length > 1 ? (
          <div className="rounded-3xl border border-white/8 bg-slate-950/50 p-4">
            <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
              <span>Recent transfer activity</span>
              <span>{formatRelativeDay(recentTransactions.at(-1)?.createdAt)}</span>
            </div>
            <svg viewBox="0 0 100 100" className="h-40 w-full overflow-visible">
              <defs>
                <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke="#7dd3fc"
                strokeWidth="2.75"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={recentTransactions
                  .map((transaction, index) => {
                    const x = recentTransactions.length > 1 ? (index / (recentTransactions.length - 1)) * 100 : 50;
                    const y = 100 - (transaction.amount / maxTransactionAmount) * 100;
                    return `${x},${Math.max(8, Math.min(92, y))}`;
                  })
                  .join(" ")}
              />
              <polygon
                fill="url(#activity-fill)"
                points={`0,100 ${recentTransactions
                  .map((transaction, index) => {
                    const x = recentTransactions.length > 1 ? (index / (recentTransactions.length - 1)) * 100 : 50;
                    const y = 100 - (transaction.amount / maxTransactionAmount) * 100;
                    return `${x},${Math.max(8, Math.min(92, y))}`;
                  })
                  .join(" ")} 100,100`}
              />
            </svg>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
