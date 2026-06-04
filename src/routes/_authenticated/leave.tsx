import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/leave")({
  head: () => ({ meta: [{ title: "Leave — WorkforceOS" }] }),
  component: Leave,
});

const STATUS_COLOR: Record<string, "default" | "secondary" | "destructive"> = { pending: "secondary", approved: "default", rejected: "destructive", cancelled: "secondary" };

function Leave() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: "", leave_type: "casual", start_date: "", end_date: "", reason: "" });

  const { data: leaves = [] } = useQuery({
    queryKey: ["leaves"],
    queryFn: async () => (await supabase.from("leave_requests").select("*, employees(full_name)").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: employees = [] } = useQuery({
    queryKey: ["employees-min"],
    queryFn: async () => (await supabase.from("employees").select("id, full_name, tenant_id")).data ?? [],
  });

  const create = useMutation({
    mutationFn: async () => {
      const emp = employees.find(e => e.id === form.employee_id);
      if (!emp) throw new Error("Pick an employee");
      const { error } = await supabase.from("leave_requests").insert({ ...form, tenant_id: emp.tenant_id, leave_type: form.leave_type as any });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Leave requested"); setOpen(false); qc.invalidateQueries({ queryKey: ["leaves"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const decide = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase.from("leave_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["leaves"] }); },
  });

  return (
    <div>
      <PageHeader
        title="Leave management"
        subtitle="Requests and approvals"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="bg-gradient-hero shadow-elegant"><Plus className="mr-2 h-4 w-4" />New request</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Request leave</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="space-y-1.5">
                  <Label>Employee</Label>
                  <Select value={form.employee_id} onValueChange={v => setForm({ ...form, employee_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Leave type</Label>
                  <Select value={form.leave_type} onValueChange={v => setForm({ ...form, leave_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["casual","sick","earned","unpaid","maternity"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>From</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>To</Label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
                </div>
                <div className="space-y-1.5"><Label>Reason</Label><Textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={() => create.mutate()} disabled={create.isPending || !form.employee_id || !form.start_date || !form.end_date}>Submit</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="p-8">
        <Card className="border-border/60 shadow-card">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Employee</TableHead><TableHead>Type</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No leave requests yet</TableCell></TableRow>
              ) : leaves.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{(l as any).employees?.full_name}</TableCell>
                  <TableCell className="capitalize">{l.leave_type}</TableCell>
                  <TableCell>{l.start_date}</TableCell>
                  <TableCell>{l.end_date}</TableCell>
                  <TableCell><Badge variant={STATUS_COLOR[l.status] ?? "secondary"}>{l.status}</Badge></TableCell>
                  <TableCell>
                    {l.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => decide.mutate({ id: l.id, status: "approved" })}><Check className="h-4 w-4 text-success" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => decide.mutate({ id: l.id, status: "rejected" })}><X className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
