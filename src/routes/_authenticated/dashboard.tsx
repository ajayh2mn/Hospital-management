import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CalendarDays, Stethoscope, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — WorkforceOS" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [emps, att, leaves, appts] = await Promise.all([
        supabase.from("employees").select("id", { count: "exact", head: true }),
        supabase.from("attendance").select("id", { count: "exact", head: true }).eq("date", today),
        supabase.from("leave_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("appointments").select("id", { count: "exact", head: true }).gte("scheduled_at", today),
      ]);
      return { emps: emps.count ?? 0, att: att.count ?? 0, leaves: leaves.count ?? 0, appts: appts.count ?? 0 };
    },
  });

  const cards = [
    { l: "Total employees", v: stats?.emps ?? 0, i: Users, c: "text-primary" },
    { l: "Today's check-ins", v: stats?.att ?? 0, i: Calendar, c: "text-accent" },
    { l: "Pending leaves", v: stats?.leaves ?? 0, i: CalendarDays, c: "text-warning" },
    { l: "Upcoming appointments", v: stats?.appts ?? 0, i: Stethoscope, c: "text-success" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Live snapshot of your workforce" />
      <div className="grid gap-4 px-8 pb-8 md:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ l, v, i: Icon, c }) => (
          <Card key={l} className="border-border/60 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{l}</CardTitle>
              <Icon className={`h-4 w-4 ${c}`} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-3xl font-bold">{v}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-success"><TrendingUp className="h-3 w-3" /> Updated just now</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 px-8 pb-8 lg:grid-cols-2">
        <Card className="border-border/60 shadow-card">
          <CardHeader><CardTitle className="font-display">Welcome to WorkforceOS</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Your workspace is ready. Start by adding employees and departments, then enable attendance tracking.</p>
            <ul className="space-y-1.5 text-foreground">
              <li>• Add your first employees in <strong>Employees</strong></li>
              <li>• Configure shifts and let staff check in via <strong>Attendance</strong></li>
              <li>• Schedule patient appointments in <strong>Hospital</strong></li>
              <li>• Run payroll at month-end in <strong>Payroll</strong></li>
            </ul>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-card">
          <CardHeader><CardTitle className="font-display">AI insights — coming soon</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg bg-gradient-hero/10 p-4 text-sm">
              <p className="text-foreground">Attrition prediction, resume ranking, anomaly detection and an AI HR assistant are on the roadmap. They'll plug into this same workspace.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
