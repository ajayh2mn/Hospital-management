import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/employees")({
  head: () => ({ meta: [{ title: "Employees — WorkforceOS" }] }),
  component: Employees,
});

function Employees() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee_code: "", full_name: "", email: "", phone: "", designation: "", base_salary: "0" });

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user!.id).maybeSingle();
      if (!profile?.tenant_id) throw new Error("No tenant");
      const { error } = await supabase.from("employees").insert({
        ...form,
        tenant_id: profile.tenant_id,
        base_salary: Number(form.base_salary) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Employee added");
      setOpen(false);
      setForm({ employee_code: "", full_name: "", email: "", phone: "", designation: "", base_salary: "0" });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Manage your workforce records"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-hero shadow-elegant"><Plus className="mr-2 h-4 w-4" /> Add employee</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New employee</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2 sm:grid-cols-2">
                {[
                  { k: "employee_code", l: "Employee code" },
                  { k: "full_name", l: "Full name" },
                  { k: "email", l: "Email" },
                  { k: "phone", l: "Phone" },
                  { k: "designation", l: "Designation" },
                  { k: "base_salary", l: "Base salary", type: "number" },
                ].map(f => (
                  <div key={f.k} className="space-y-1.5">
                    <Label>{f.l}</Label>
                    <Input type={f.type ?? "text"} value={(form as any)[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={() => create.mutate()} disabled={create.isPending || !form.employee_code || !form.full_name}>
                  Save employee
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="p-8">
        <Card className="border-border/60 shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
              ) : employees.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No employees yet. Add your first one.</TableCell></TableRow>
              ) : (
                employees.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs">{e.employee_code}</TableCell>
                    <TableCell className="font-medium">{e.full_name}</TableCell>
                    <TableCell>{e.designation || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{e.email || "—"}</TableCell>
                    <TableCell>₹{Number(e.base_salary).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="secondary">{e.status}</Badge></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
