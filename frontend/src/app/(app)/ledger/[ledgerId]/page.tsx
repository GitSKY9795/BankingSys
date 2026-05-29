"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { History, LockKeyhole } from "lucide-react";
import { ledgerApi } from "@/lib/api";
import { formatCurrency, formatDate, shortId } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LedgerDetailPage() {
  const params = useParams<{ ledgerId: string }>();
  const ledgerId = params.ledgerId;

  const detailQuery = useQuery({
    queryKey: ["ledger", ledgerId],
    queryFn: async () => (await ledgerApi.detail(ledgerId)).entry,
    enabled: Boolean(ledgerId),
  });

  const entry = detailQuery.data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Ledger entry</CardTitle>
            <CardDescription>Read-only immutable entry with transaction and account references.</CardDescription>
          </div>
          <Badge tone={entry?.type === "CREDIT" ? "success" : "danger"}>{entry?.type || "Loading"}</Badge>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-200 ring-1 ring-sky-400/15">
                <History className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Entry ID</p>
                <h2 className="text-2xl font-semibold text-white">{shortId(entry?._id)}</h2>
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Amount</p>
              <p className="mt-2 text-4xl font-semibold text-white">{formatCurrency(entry?.amount || 0)}</p>
            </div>

            <div className="space-y-3 rounded-3xl border border-white/8 bg-white/4 p-5">
              <InfoRow label="Account" value={shortId(typeof entry?.account === "string" ? entry.account : entry?.account?._id)} />
              <InfoRow label="Transaction" value={shortId(typeof entry?.transaction === "string" ? entry.transaction : entry?.transaction?._id)} />
              <InfoRow label="Created" value={formatDate(entry?.createdAt)} />
            </div>

            <div className="rounded-3xl border border-rose-400/15 bg-rose-400/5 p-4 text-sm leading-6 text-rose-100/90">
              <div className="flex items-center gap-2 font-medium text-rose-200">
                <LockKeyhole className="h-4 w-4" />
                Immutable audit entry
              </div>
              <p className="mt-2">This record is write-protected on the backend. Updates and deletes are blocked at the model layer.</p>
            </div>

            <Button asChild variant="secondary" className="w-full">
              <Link href="/ledger">
                Back to ledger
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Reference links</CardTitle>
              <CardDescription>Jump to the associated transaction or account record.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ReferenceLink label="Open transaction" href={`/transactions/${typeof entry?.transaction === "string" ? entry.transaction : entry?.transaction?._id || ""}`} />
            <ReferenceLink label="Open account" href={`/accounts/${typeof entry?.account === "string" ? entry.account : entry?.account?._id || ""}`} />
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

function ReferenceLink({ label, href }: Readonly<{ label: string; href: string }>) {
  return (
    <Button asChild variant="secondary" className="w-full justify-start">
      <Link href={href}>{label}</Link>
    </Button>
  );
}
