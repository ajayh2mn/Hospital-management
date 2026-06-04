import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({ meta: [{ title: "Attendance — WorkforceOS" }] }),
  component: Attendance,
});

function Attendance() {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: records = [] } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance").select("*, employees(full_name, employee_code)")
        .eq("date", today).order("check_in", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees-min"],
    queryFn: async () => (await supabase.from("employees").select("id, full_name, tenant_id").limit(50)).data ?? [],
  });

  const checkIn = useMutation({
    mutationFn: async (employeeId: string) => {
      const emp = employees.find(e => e.id === employeeId);
      if (!emp) throw new Error("Employee not found");
      const { error } = await supabase.from("attendance").insert({
        tenant_id: emp.tenant_id, employee_id: employeeId, check_in: new Date().toISOString(), date: today, status: "present",
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Checked in"); qc.invalidateQueries({ queryKey: ["attendance-today"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const checkOut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("attendance").update({ check_out: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Checked out"); qc.invalidateQueries({ queryKey: ["attendance-today"] }); },
  });

  return (
    <div>
      <PageHeader title="Attendance" subtitle={`Today, ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`} />
      <div className="grid gap-4 p-8 lg:grid-cols-3">
        <Card className="lg:col-span-1 border-border/60 shadow-card">
          <CardHeader><CardTitle className="font-display text-lg">Quick check-in</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {employees.length === 0 && <p className="text-sm text-muted-foreground">Add employees first.</p>}
            {employees.map(e => (
              <Button key={e.id} variant="outline" className="w-full justify-between" onClick={() => checkIn.mutate(e.id)} disabled={checkIn.isPending}>
                <span className="truncate">{e.full_name}</span><LogIn className="h-4 w-4" />
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/60 shadow-card">
          <CardHeader><CardTitle className="font-display text-lg">Today's log</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Employee</TableHead><TableHead>Check-in</TableHead><TableHead>Check-out</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No check-ins yet today</TableCell></TableRow>
                ) : records.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{(r as any).employees?.full_name}</TableCell>
                    <TableCell>{r.check_in ? new Date(r.check_in).toLocaleTimeString() : "—"}</TableCell>
                    <TableCell>{r.check_out ? new Date(r.check_out).toLocaleTimeString() : "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{r.status}</Badge></TableCell>
                    <TableCell>{!r.check_out && <Button size="sm" variant="ghost" onClick={() => checkOut.mutate(r.id)}><LogOut className="h-4 w-4" /></Button>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
