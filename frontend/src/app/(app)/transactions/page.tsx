"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownUp, Download, Filter } from "lucide-react";
import { accountApi, transactionApi } from "@/lib/api";
import { formatCurrency, formatDate, shortId } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TransferForm } from "@/components/forms/transfer-form";

type FilterState = {
  accountId: string;
  type: "all" | "sent" | "received";
  from: string;
  to: string;
};

export default function TransactionsPage() {
  const [filters, setFilters] = useState<FilterState>({ accountId: "", type: "all", from: "", to: "" });
  const accountsQuery = useQuery({ queryKey: ["accounts"], queryFn: async () => (await accountApi.list()).accounts || [] });

  const transactionsQuery = useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () =>
      (
        await transactionApi.list({
          accountId: filters.accountId || undefined,
          type: filters.type === "all" ? undefined : filters.type,
          from: filters.from || undefined,
          to: filters.to || undefined,
          limit: 500,
        })
      ).transactions || [],
  });

  const transactions = transactionsQuery.data || [];
  const csvUrl = buildCsv(transactions);

  function exportCsv() {
    const link = document.createElement("a");
    link.href = csvUrl;
    link.download = "ledgered-transactions.csv";
    link.click();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TransferForm accounts={accountsQuery.data || []} />

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Transfer history</CardTitle>
              <CardDescription>Filter own-account transfers and export the current result set as CSV.</CardDescription>
            </div>
            <Button variant="secondary" size="sm" onClick={exportCsv} disabled={!transactions.length}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <select className="h-11 rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none" value={filters.accountId} onChange={(event) => setFilters((current) => ({ ...current, accountId: event.target.value }))}>
                <option value="">All accounts</option>
                {accountsQuery.data?.map((account) => <option key={account._id} value={account._id}>{shortId(account._id)}</option>)}
              </select>
              <select className="h-11 rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none" value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value as FilterState['type'] }))}>
                <option value="all">All types</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
              </select>
              <Input type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} />
              <Input type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} />
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Filter className="h-4 w-4" />
              <span>{transactions.length} transaction{transactions.length === 1 ? "" : "s"} loaded</span>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/8">
              <table className="min-w-full divide-y divide-white/8 text-left">
                <thead className="bg-white/4 text-xs uppercase tracking-[0.25em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Route</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8 bg-slate-950/50">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-white/3">
                      <td className="px-4 py-4 text-sm text-slate-300">{formatDate(transaction.createdAt)}</td>
                      <td className="px-4 py-4">
                        <Link href={`/transactions/${transaction._id}`} className="group inline-flex items-center gap-2 text-sm text-white">
                          <ArrowDownUp className="h-4 w-4 text-sky-300" />
                          <span>{shortId(typeof transaction.fromAccount === "string" ? transaction.fromAccount : transaction.fromAccount._id)} → {shortId(typeof transaction.toAccount === "string" ? transaction.toAccount : transaction.toAccount._id)}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-sky-200">{formatCurrency(transaction.amount)}</td>
                      <td className="px-4 py-4">{renderStatusBadge(transaction.status)}</td>
                    </tr>
                  ))}

                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">No transactions match the current filters.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function buildCsv(transactions: Transaction[]) {
  const rows = [
    ["id", "createdAt", "fromAccount", "toAccount", "amount", "status"],
    ...transactions.map((transaction) => [
      transaction._id,
      transaction.createdAt,
      typeof transaction.fromAccount === "string" ? transaction.fromAccount : transaction.fromAccount._id,
      typeof transaction.toAccount === "string" ? transaction.toAccount : transaction.toAccount._id,
      transaction.amount,
      transaction.status,
    ]),
  ];

  return URL.createObjectURL(new Blob([rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n")], { type: "text/csv;charset=utf-8;" }));
}

function renderStatusBadge(status: string) {
  const tone = getTransactionTone(status);
  return <Badge tone={tone}>{status}</Badge>;
}

function getTransactionTone(status: string) {
  if (status === "COMPLETED") {
    return "success";
  }

  if (status === "PENDING") {
    return "warning";
  }

  return "danger";
}
