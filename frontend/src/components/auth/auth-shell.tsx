import { ShieldCheck, Sparkles, BadgeDollarSign, Fingerprint } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const highlights = [
  { icon: ShieldCheck, label: "Cookie-backed auth", value: "HttpOnly session cookies" },
  { icon: BadgeDollarSign, label: "Ledger accurate", value: "Balances derived from entries" },
  { icon: Fingerprint, label: "Safe transfers", value: "Idempotent transaction keys" },
];

export function AuthShell({ children, eyebrow, title, description }: Readonly<{ children: React.ReactNode; eyebrow: string; title: string; description: string }>) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 lg:px-8 lg:py-10">
      <div className="absolute inset-0 grid-noise opacity-40" />
      <div className="absolute left-[-8rem] top-10 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="absolute bottom-[-8rem] right-0 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="space-y-8 lg:pr-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm text-sky-100">
            <Sparkles className="h-4 w-4" />
            <span>Ledgered banking interface</span>
            <Badge tone="muted">Dark by default</Badge>
          </div>

          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{eyebrow}</p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl xl:text-6xl">{title}</h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-200 ring-1 ring-sky-400/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-100">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{item.value}</p>
                </Card>
              );
            })}
          </div>

          <Card className="border-sky-400/10 bg-sky-400/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Backed by</p>
                <h2 className="mt-1 text-lg font-semibold text-white">Next.js 15, Radix UI, TanStack Query, Zod</h2>
              </div>
              <Badge tone="success">Production-ready layout</Badge>
            </div>
          </Card>
        </section>

        <section className="lg:pl-6">
          <Card className="glass-strong relative overflow-hidden p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
            <div className="mb-8 space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{eyebrow}</p>
              <h2 className="text-2xl font-semibold text-white">{title}</h2>
              <p className="text-sm leading-6 text-slate-400">{description}</p>
            </div>
            {children}
          </Card>
        </section>
      </div>
    </div>
  );
}
