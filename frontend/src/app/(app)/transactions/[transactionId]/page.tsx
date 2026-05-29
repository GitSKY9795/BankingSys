"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRightLeft, ReceiptText } from "lucide-react";
import { transactionApi } from "@/lib/api";
import { formatCurrency, formatDate, shortId } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionDetailPage() {
  const params = useParams<{ transactionId: string }>();
  const transactionId = params.transactionId;

  const detailQuery = useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: async () => await transactionApi.detail(transactionId),
    enabled: Boolean(transactionId),
  });

  const transaction = detailQuery.data?.transaction;
  const ledgerEntries = detailQuery.data?.ledgerEntries || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Transaction detail</CardTitle>
            <CardDescription>Transfer metadata and ledger-backed immutable history for one transaction.</CardDescription>
          </div>
          <Badge tone={getTransactionTone(transaction?.status)}>{transaction?.status || "Loading"}</Badge>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-200 ring-1 ring-sky-400/15">
                <ReceiptText className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Transaction</p>
                <h2 className="text-2xl font-semibold text-white">{shortId(transaction?._id)}</h2>
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Amount</p>
              <p className="mt-2 text-4xl font-semibold text-white">{formatCurrency(transaction?.amount || 0)}</p>
            </div>

            <div className="space-y-3 rounded-3xl border border-white/8 bg-white/4 p-5">
              <InfoRow label="From" value={shortId(typeof transaction?.fromAccount === "string" ? transaction.fromAccount : transaction?.fromAccount?._id)} />
              <InfoRow label="To" value={shortId(typeof transaction?.toAccount === "string" ? transaction.toAccount : transaction?.toAccount?._id)} />
              <InfoRow label="Idempotency key" value={transaction?.idempotencyKey || "—"} />
              <InfoRow label="Created" value={formatDate(transaction?.createdAt)} />
            </div>

            <Button asChild variant="secondary" className="w-full">
              <Link href="/transactions">
                Back to transfers
                <ArrowRightLeft className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Associated ledger entries</CardTitle>
              <CardDescription>Immutable debit and credit entries that make up the transfer.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {ledgerEntries.map((entry) => (
              <Link key={entry._id} href={`/ledger/${entry._id}`} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3 transition hover:bg-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{shortId(entry._id)}</p>
                  <p className="text-xs text-slate-400">{shortId(typeof entry.account === "string" ? entry.account : entry.account._id)}</p>
                </div>
                <div className="text-right">
                  <Badge tone={entry.type === "CREDIT" ? "success" : "danger"}>{entry.type}</Badge>
                  <p className="mt-2 text-sm font-semibold text-sky-200">{formatCurrency(entry.amount)}</p>
                </div>
              </Link>
            ))}

            {ledgerEntries.length === 0 ? <p className="py-8 text-center text-sm text-slate-400">No ledger entries linked to this transaction.</p> : null}
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

function getTransactionTone(status?: string) {
  if (status === "COMPLETED") {
    return "success";
  }

  if (status === "PENDING") {
    return "warning";
  }

  return "danger";
}
