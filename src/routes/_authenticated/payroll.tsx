import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/payroll")({
  head: () => ({ meta: [{ title: "Payroll — WorkforceOS" }] }),
  component: Payroll,
});

function Payroll() {
  const qc = useQueryClient();
  const now = new Date();
  const month = now.getMonth() + 1, year = now.getFullYear();

  const { data: runs = [] } = useQuery({
    queryKey: ["payroll", month, year],
    queryFn: async () => (await supabase.from("payroll_runs").select("*, employees(full_name, employee_code)")
      .eq("period_month", month).eq("period_year", year)).data ?? [],
  });

  const runPayroll = useMutation({
    mutationFn: async () => {
      const { data: emps } = await supabase.from("employees").select("id, tenant_id, base_salary, full_name").eq("status", "active");
      if (!emps?.length) throw new Error("No active employees");
      const rows = emps.map(e => {
        const gross = Number(e.base_salary) || 0;
        const deductions = Math.round(gross * 0.1 * 100) / 100;
        return { tenant_id: e.tenant_id, employee_id: e.id, period_month: month, period_year: year, gross, deductions, net: gross - deductions, status: "processed" };
      });
      const { error } = await supabase.from("payroll_runs").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Payroll processed"); qc.invalidateQueries({ queryKey: ["payroll", month, year] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Payroll"
        subtitle={`Period: ${now.toLocaleString("en-US", { month: "long" })} ${year}`}
        action={<Button onClick={() => runPayroll.mutate()} disabled={runPayroll.isPending || runs.length > 0} className="bg-gradient-hero shadow-elegant"><Play className="mr-2 h-4 w-4" />Run payroll</Button>}
      />
      <div className="p-8">
        <Card className="border-border/60 shadow-card">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Code</TableHead><TableHead>Employee</TableHead><TableHead>Gross</TableHead><TableHead>Deductions</TableHead><TableHead>Net</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {runs.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No payroll run yet for this period. Click "Run payroll" to process all active employees.</TableCell></TableRow>
              ) : runs.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{(r as any).employees?.employee_code}</TableCell>
                  <TableCell className="font-medium">{(r as any).employees?.full_name}</TableCell>
                  <TableCell>₹{Number(r.gross).toLocaleString()}</TableCell>
                  <TableCell className="text-destructive">−₹{Number(r.deductions).toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">₹{Number(r.net).toLocaleString()}</TableCell>
                  <TableCell><Badge>{r.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
