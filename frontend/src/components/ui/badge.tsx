import { cn } from "@/lib/utils";

function Badge({ className, tone = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "success" | "warning" | "danger" | "muted" }) {
  const tones = {
    default: "bg-sky-400/15 text-sky-200 border-sky-400/25",
    success: "bg-emerald-400/15 text-emerald-200 border-emerald-400/25",
    warning: "bg-amber-400/15 text-amber-200 border-amber-400/25",
    danger: "bg-rose-400/15 text-rose-200 border-rose-400/25",
    muted: "bg-white/5 text-slate-300 border-white/10",
  } as const;

  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", tones[tone], className)} {...props} />;
}

export { Badge };
