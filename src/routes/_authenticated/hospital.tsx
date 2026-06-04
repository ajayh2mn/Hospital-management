import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/hospital")({
  head: () => ({ meta: [{ title: "Hospital — WorkforceOS" }] }),
  component: Hospital,
});

const NEXT: Record<string, string> = { scheduled: "checked_in", checked_in: "in_progress", in_progress: "completed" };

function Hospital() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patient_name: "", patient_phone: "", scheduled_at: "", doctor_id: "" });

  const { data: appts = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => (await supabase.from("appointments").select("*, employees(full_name)").order("scheduled_at", { ascending: true })).data ?? [],
  });
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => (await supabase.from("employees").select("id, full_name, tenant_id")).data ?? [],
  });

  const create = useMutation({
    mutationFn: async () => {
      const doctor = doctors.find(d => d.id === form.doctor_id) || doctors[0];
      if (!doctor) throw new Error("Add a doctor (employee) first");
      const token = (appts.filter(a => a.scheduled_at.slice(0,10) === form.scheduled_at.slice(0,10)).length) + 1;
      const { error } = await supabase.from("appointments").insert({
        tenant_id: doctor.tenant_id,
        patient_name: form.patient_name, patient_phone: form.patient_phone,
        scheduled_at: form.scheduled_at, doctor_id: form.doctor_id || null, token_number: token,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Appointment created"); setOpen(false); setForm({ patient_name: "", patient_phone: "", scheduled_at: "", doctor_id: "" }); qc.invalidateQueries({ queryKey: ["appointments"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const advance = useMutation({
    mutationFn: async (id: string) => {
      const a = appts.find(x => x.id === id);
      const next = a ? NEXT[a.status] : null;
      if (!next) return;
      const { error } = await supabase.from("appointments").update({ status: next as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const queue = appts.filter(a => ["scheduled", "checked_in", "in_progress"].includes(a.status));

  return (
    <div>
      <PageHeader
        title="Hospital operations"
        subtitle="Appointments & live patient queue"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="bg-gradient-hero shadow-elegant"><Plus className="mr-2 h-4 w-4" />New appointment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule appointment</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="space-y-1.5"><Label>Patient name</Label><Input value={form.patient_name} onChange={e => setForm({ ...form, patient_name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Phone</Label><Input value={form.patient_phone} onChange={e => setForm({ ...form, patient_phone: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Date & time</Label><Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} /></div>
                <div className="space-y-1.5">
                  <Label>Doctor</Label>
                  <Select value={form.doctor_id} onValueChange={v => setForm({ ...form, doctor_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                    <SelectContent>{doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button onClick={() => create.mutate()} disabled={create.isPending || !form.patient_name || !form.scheduled_at}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-4 p-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 shadow-card">
          <CardHeader><CardTitle className="font-display text-lg">Live queue</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {queue.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No patients in queue</p>}
            {queue.map(a => (
              <div key={a.id} className="flex items-center gap-4 rounded-lg border border-border bg-card/50 p-3">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-hero font-display text-lg font-bold text-primary-foreground">
                  #{a.token_number ?? "?"}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{a.patient_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(a.scheduled_at).toLocaleString()} {(a as any).employees?.full_name && `· Dr. ${(a as any).employees.full_name}`}
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">{a.status.replace("_"," ")}</Badge>
                {NEXT[a.status] && (
                  <Button size="sm" variant="outline" onClick={() => advance.mutate(a.id)}>
                    Next <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-card">
          <CardHeader><CardTitle className="font-display text-lg">Today</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Scheduled</span><span className="font-semibold">{appts.filter(a=>a.status==="scheduled").length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">In progress</span><span className="font-semibold text-accent">{appts.filter(a=>a.status==="in_progress").length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Completed</span><span className="font-semibold text-success">{appts.filter(a=>a.status==="completed").length}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
