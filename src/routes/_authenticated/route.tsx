import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Activity, LayoutDashboard, Users, Calendar, CalendarDays, Wallet, Stethoscope, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/attendance", label: "Attendance", icon: Calendar },
  { to: "/leave", label: "Leave", icon: CalendarDays },
  { to: "/payroll", label: "Payroll", icon: Wallet },
  { to: "/hospital", label: "Hospital", icon: Stethoscope },
] as const;

function AuthedLayout() {
  const router = useRouter();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*, tenants(name)").eq("id", user.id).maybeSingle();
      return data;
    },
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col bg-gradient-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2 border-b border-sidebar-border px-6 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-hero shadow-glow">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-sm font-bold">WorkforceOS</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">VTECH</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3">
            <div className="truncate text-sm font-medium">{profile?.full_name || "Loading…"}</div>
            <div className="truncate text-xs text-sidebar-foreground/60">{profile?.tenants?.name}</div>
          </div>
          <Button variant="outline" size="sm" onClick={signOut} className="w-full border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
