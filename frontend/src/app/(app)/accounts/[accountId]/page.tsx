"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRightLeft, Wallet2 } from "lucide-react";
import { accountApi } from "@/lib/api";
import { formatCurrency, formatDate, shortId } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountDetailPage() {
  const params = useParams<{ accountId: string }>();
  const accountId = params.accountId;

  const detailQuery = useQuery({
    queryKey: ["account", accountId],
    queryFn: async () => await accountApi.details(accountId),
    enabled: Boolean(accountId),
  });

  const account = detailQuery.data?.account;
  const recentLedgerEntries = detailQuery.data?.recentLedgerEntries || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Account detail</CardTitle>
            <CardDescription>Read-only ledger-backed view of one wallet and its most recent entries.</CardDescription>
          </div>
          <Badge tone={account?.status === "ACTIVE" ? "success" : "muted"}>{account?.status || "Loading"}</Badge>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-200 ring-1 ring-sky-400/15">
                <Wallet2 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{account?.currency || "—"}</p>
                <h2 className="text-2xl font-semibold text-white">{shortId(account?._id)}</h2>
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Live balance</p>
              <p className="mt-2 text-4xl font-semibold text-white">{formatCurrency(account?.balance || 0, account?.currency)}</p>
            </div>

            <div className="space-y-3 rounded-3xl border border-white/8 bg-white/4 p-5">
              <InfoRow label="Created" value={formatDate(account?.createdAt)} />
              <InfoRow label="Updated" value={formatDate(account?.updatedAt)} />
              <InfoRow label="Account ID" value={shortId(account?._id)} />
            </div>

            <Button asChild variant="secondary" className="w-full">
              <Link href="/transactions">
                Make a transfer
                <ArrowRightLeft className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent ledger entries</CardTitle>
              <CardDescription>Immutable entries associated with this account.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLedgerEntries.map((entry) => (
              <Link key={entry._id} href={`/ledger/${entry._id}`} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3 transition hover:bg-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{shortId(entry._id)}</p>
                  <p className="text-xs text-slate-400">{formatDate(entry.createdAt)}</p>
                </div>
                <div className="text-right">
                  <Badge tone={entry.type === "CREDIT" ? "success" : "danger"}>{entry.type}</Badge>
                  <p className="mt-2 text-sm font-semibold text-sky-200">{formatCurrency(entry.amount)}</p>
                </div>
              </Link>
            ))}

            {recentLedgerEntries.length === 0 ? <p className="py-8 text-center text-sm text-slate-400">No ledger activity yet for this account.</p> : null}
          </CardContent>
        </Card>
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
