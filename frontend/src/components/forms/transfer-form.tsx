"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { transactionApi, accountApi } from "@/lib/api";
import { transferSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Account } from "@/lib/types";
import type { z } from "zod";

type TransferFormInput = z.input<typeof transferSchema>;
type TransferFormOutput = z.output<typeof transferSchema>;

export function TransferForm({
  accounts,
  onSuccess,
  compact = false,
}: Readonly<{
  accounts: Account[];
  onSuccess?: () => void;
  compact?: boolean;
}>) {
  const queryClient = useQueryClient();
  const form = useForm<TransferFormInput, unknown, TransferFormOutput>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccount: accounts[0]?._id || "",
      toAccount: accounts[1]?._id || accounts[0]?._id || "",
      amount: 0,
      idempotencyKey: "",
    },
  });

  const { data: otherResp } = useQuery({ queryKey: ["otherAccounts"], queryFn: () => accountApi.others() });
  const otherAccounts: Account[] = otherResp?.accounts || [];

  useEffect(() => {
    form.setValue("idempotencyKey", globalThis.crypto?.randomUUID?.() || `${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`);
  }, [form]);

  const mutation = useMutation({
    mutationFn: transactionApi.create,
    onSuccess: async () => {
      toast.success("Transfer submitted successfully");
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["ledger"] });
      form.reset({
        fromAccount: accounts[0]?._id || "",
        toAccount: accounts[1]?._id || accounts[0]?._id || "",
        amount: 0,
        idempotencyKey: "",
      });
      onSuccess?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!accounts.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick transfer</CardTitle>
          <CardDescription>Create at least two accounts before transferring funds.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn(compact ? "p-5" : "")}> 
      <CardHeader>
        <div>
          <CardTitle>Quick transfer</CardTitle>
          <CardDescription>Move money between your own accounts with idempotent transfer protection.</CardDescription>
        </div>
        <ArrowRightLeft className="h-5 w-5 text-sky-300" />
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="fromAccount" className="text-sm font-medium text-slate-200">From account</label>
              <select id="fromAccount" className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none" {...form.register("fromAccount")}>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>{account._id.slice(-8)} • {account.currency}</option>
                ))}
              </select>
              {form.formState.errors.fromAccount ? <p className="text-sm text-rose-300">{form.formState.errors.fromAccount.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="toAccount" className="text-sm font-medium text-slate-200">To account</label>
              <select id="toAccount" className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none" {...form.register("toAccount")}>
                <optgroup label="Your accounts">
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>{account._id.slice(-8)} • {account.currency}</option>
                  ))}
                </optgroup>
                {otherAccounts.length ? (
                  <optgroup label="Other users' accounts">
                    {otherAccounts.map((account) => (
                      <option key={account._id} value={account._id}>{account._id.slice(-8)} • {account.currency} — {account.user?.email}</option>
                    ))}
                  </optgroup>
                ) : null}
              </select>
              {form.formState.errors.toAccount ? <p className="text-sm text-rose-300">{form.formState.errors.toAccount.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium text-slate-200">Amount</label>
              <Input id="amount" type="number" min="0" step="0.01" placeholder="0.00" {...form.register("amount")} />
              {form.formState.errors.amount ? <p className="text-sm text-rose-300">{form.formState.errors.amount.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label htmlFor="idempotencyKey" className="text-sm font-medium text-slate-200">Request key</label>
              <Input id="idempotencyKey" readOnly className="font-mono text-xs" {...form.register("idempotencyKey")} />
            </div>
          </div>

          <Button className="w-full" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send transfer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
