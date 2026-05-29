"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Building2, Clock3, LayoutDashboard, LogOut, UserCircle2, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Building2 },
  { href: "/transactions", label: "Transfers", icon: ArrowRightLeft },
  { href: "/ledger", label: "Ledger", icon: Clock3 },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
];

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => (await authApi.me()).user,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const user = userQuery.data;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 grid-noise opacity-40" />
      <div className="absolute left-[-10rem] top-[-8rem] h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="absolute bottom-[-8rem] right-[-6rem] h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col lg:flex-row">
        <aside className="glass-strong hidden w-full max-w-[280px] flex-col border-r border-white/5 px-5 py-6 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-200 ring-1 ring-sky-400/20">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Ledgered</p>
              <h1 className="text-xl font-semibold text-white">Banking Control</h1>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/8 bg-white/3 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Session</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-white">{user?.name || "Loading profile"}</p>
                <p className="text-xs text-slate-400">{user?.email || "Fetching account..."}</p>
              </div>
              <Badge tone={user?.systemUser ? "success" : "muted"}>{user?.systemUser ? "Admin" : "User"}</Badge>
            </div>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-2">
            {navigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    active ? "bg-sky-400/15 text-sky-100 ring-1 ring-sky-400/15" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Separator className="my-5" />

          <div className="rounded-3xl border border-white/8 bg-white/3 p-4 text-sm text-slate-400">
            <p className="font-medium text-slate-100">Fast, cookie-backed auth</p>
            <p className="mt-2 leading-6">All calls go through a same-origin proxy, so the backend HttpOnly cookie stays intact without CORS issues.</p>
          </div>

          <Button className="mt-5 justify-start" variant="secondary" onClick={() => logoutMutation.mutate()}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="glass-strong sticky top-0 z-30 border-b border-white/5 px-4 py-4 backdrop-blur xl:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 lg:hidden">Ledgered</p>
                <h2 className="text-lg font-semibold text-white lg:text-xl">Modern banking command center</h2>
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <Badge tone={user?.systemUser ? "success" : "muted"}>{user?.systemUser ? "Admin" : "User"}</Badge>
                <Button size="sm" variant="secondary" onClick={() => logoutMutation.mutate()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              <div className="hidden items-center gap-3 lg:flex">
                <Badge tone="muted">Protected session</Badge>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  {user?.email || "Loading user..."}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden scrollbar-hidden">
              {navigation.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "whitespace-nowrap rounded-full border px-4 py-2 text-sm transition",
                      active ? "border-sky-400/25 bg-sky-400/15 text-sky-100" : "border-white/10 bg-white/5 text-slate-300"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
