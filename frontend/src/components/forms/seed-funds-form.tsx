"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wallet2 } from "lucide-react";
import { toast } from "sonner";
import { transactionApi } from "@/lib/api";
import { transferSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Account } from "@/lib/types";
import type { z } from "zod";

type SeedFormInput = z.input<typeof transferSchema>;
type SeedFormOutput = z.output<typeof transferSchema>;

export function SeedFundsForm({ accounts }: Readonly<{ accounts: Account[] }>) {
  const queryClient = useQueryClient();
  const form = useForm<SeedFormInput, unknown, SeedFormOutput>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccount: accounts[0]?._id || "",
      toAccount: accounts[0]?._id || "",
      amount: 1000,
      idempotencyKey: "",
    },
  });

  useEffect(() => {
    form.setValue("idempotencyKey", globalThis.crypto?.randomUUID?.() || `${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`);
  }, [form]);

  const mutation = useMutation({
    mutationFn: (values: SeedFormOutput) => transactionApi.seedInitialFunds(values),
    onSuccess: async () => {
      toast.success("Initial funds seeded");
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      form.reset();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!accounts.length) return null;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Initial funds seeding</CardTitle>
          <CardDescription>Admin-only demo funding for test users or seeded wallets.</CardDescription>
        </div>
        <Wallet2 className="h-5 w-5 text-emerald-300" />
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="seedToAccount" className="text-sm font-medium text-slate-200">To account</label>
              <select id="seedToAccount" className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none" {...form.register("toAccount")}>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>{account._id.slice(-8)} • {account.currency}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="seedAmount" className="text-sm font-medium text-slate-200">Amount</label>
              <Input id="seedAmount" type="number" step="0.01" min="0" {...form.register("amount")} />
            </div>
          </div>
          <Button variant="secondary" className="w-full" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Seed funds
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
