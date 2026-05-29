"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { accountApi, ledgerApi } from "@/lib/api";
import { formatCurrency, formatDate, shortId } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FilterState = {
  accountId: string;
  type: "ALL" | "CREDIT" | "DEBIT";
  search: string;
  from: string;
  to: string;
};

export default function LedgerPage() {
  const [filters, setFilters] = useState<FilterState>({ accountId: "", type: "ALL", search: "", from: "", to: "" });
  const accountsQuery = useQuery({ queryKey: ["accounts"], queryFn: async () => (await accountApi.list()).accounts || [] });

  const ledgerQuery = useQuery({
    queryKey: ["ledger", filters],
    queryFn: async () =>
      (
        await ledgerApi.list({
          accountId: filters.accountId || undefined,
          type: filters.type === "ALL" ? undefined : filters.type,
          search: filters.search || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
          limit: 500,
        })
      ).entries || [],
  });

  const entries = ledgerQuery.data || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Immutable ledger</CardTitle>
            <CardDescription>All credit and debit entries across your wallet graph, read-only and fully searchable.</CardDescription>
          </div>
          <Badge tone="muted">Audit trail</Badge>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-3 lg:grid-cols-5">
            <select className="h-11 rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none" value={filters.accountId} onChange={(event) => setFilters((current) => ({ ...current, accountId: event.target.value }))}>
              <option value="">All accounts</option>
              {accountsQuery.data?.map((account) => <option key={account._id} value={account._id}>{shortId(account._id)}</option>)}
            </select>
            <select className="h-11 rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none" value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value as FilterState['type'] }))}>
              <option value="ALL">All types</option>
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </select>
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input className="pl-11" placeholder="Search transaction or account id" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
            </div>
            <Input type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} />
            <Input type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} />
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/8">
            <table className="min-w-full divide-y divide-white/8 text-left">
              <thead className="bg-white/4 text-xs uppercase tracking-[0.25em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8 bg-slate-950/50">
                {entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-white/3">
                    <td className="px-4 py-4 text-sm text-slate-300">{formatDate(entry.createdAt)}</td>
                    <td className="px-4 py-4 text-sm text-white">{shortId(typeof entry.account === "string" ? entry.account : entry.account._id)}</td>
                    <td className="px-4 py-4"><Badge tone={entry.type === "CREDIT" ? "success" : "danger"}>{entry.type}</Badge></td>
                    <td className="px-4 py-4 text-sm font-semibold text-sky-200">{formatCurrency(entry.amount)}</td>
                    <td className="px-4 py-4 text-sm text-slate-300">
                      <Link href={`/ledger/${entry._id}`}>{shortId(typeof entry.transaction === "string" ? entry.transaction : entry.transaction._id)}</Link>
                    </td>
                  </tr>
                ))}

                {!entries.length ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">No ledger entries found for the current filter set.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
