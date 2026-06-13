import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, BrainCircuit, ShieldCheck, Stethoscope, Users, Calendar, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VTECH WorkforceOS — AI-powered HRMS for Hospitals" },
      { name: "description", content: "Unified HRMS, Payroll, Attendance, Leave & Recruitment platform built for hospitals and healthcare networks." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-hero shadow-glow">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">VTECH WorkforceOS</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#modules" className="hover:text-foreground">Modules</a>
            <a href="#hospital" className="hover:text-foreground">For Hospitals</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/auth"><Button size="sm" className="bg-gradient-hero shadow-elegant">Get started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-[0.08]" />
        <div className="absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
        <div className="mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            AI-powered workforce management
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            The operating system <br />for your <span className="text-gradient">healthcare workforce</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            HRMS, payroll, attendance, leave, recruitment and patient queue management — unified in one secure, multi-tenant SaaS platform purpose-built for hospitals.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-hero shadow-elegant">
                Start free trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#modules">
              <Button size="lg" variant="outline">Explore modules</Button>
            </a>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
            {["HIPAA-ready architecture", "Role-based access", "Multi-tenant SaaS", "Realtime analytics"].map(t => (
              <div key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent" />{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
            </div>
            <div className="ml-3 text-xs text-muted-foreground">workforceos.app/dashboard</div>
          </div>
          <div className="grid grid-cols-12 gap-4 bg-muted/30 p-6">
            <div className="col-span-3 space-y-2">
              {[Users, Calendar, BarChart3, Stethoscope].map((Icon, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-card p-3 text-sm">
                  <Icon className="h-4 w-4 text-primary" /> <span className="font-medium">{["Employees","Attendance","Analytics","Patients"][i]}</span>
                </div>
              ))}
            </div>
            <div className="col-span-9 grid grid-cols-3 gap-4">
              {[
                { l: "Active staff", v: "1,284", d: "+12 this week", c: "text-success" },
                { l: "Today's attendance", v: "94.2%", d: "+2.1% vs last week", c: "text-success" },
                { l: "Pending leaves", v: "23", d: "8 require approval", c: "text-warning" },
              ].map(s => (
                <div key={s.l} className="rounded-lg border border-border bg-card p-4">
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                  <div className="mt-2 font-display text-3xl font-bold">{s.v}</div>
                  <div className={`mt-1 text-xs ${s.c}`}>{s.d}</div>
                </div>
              ))}
              <div className="col-span-3 h-40 rounded-lg border border-border bg-gradient-card p-4">
                <div className="text-sm font-medium">Weekly attendance trend</div>
                <div className="mt-4 flex h-20 items-end gap-2">
                  {[60, 75, 82, 68, 90, 85, 94].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-gradient-hero" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-sm font-medium text-accent">Why VTECH</div>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">Everything HR needs. Nothing they don't.</h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { i: BrainCircuit, t: "AI-powered insights", d: "Attrition prediction, anomaly detection, and resume ranking built in." },
              { i: ShieldCheck, t: "Enterprise-grade security", d: "Multi-tenant isolation, RBAC, audit logs, encrypted data at rest." },
              { i: Stethoscope, t: "Built for healthcare", d: "Doctor scheduling, patient queues, appointment management." },
            ].map(f => (
              <div key={f.t} className="rounded-xl border border-border bg-card p-6 shadow-card transition hover:shadow-elegant">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-hero shadow-glow">
                  <f.i className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">One platform, every workflow</h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
            {[
              { t: "Employee Management", d: "Records, departments, designations, documents, shifts." },
              { t: "Attendance", d: "Check-in/out, geo-fencing, biometric-ready, live analytics." },
              { t: "Payroll", d: "Salary structures, payslips, deductions, processing." },
              { t: "Leave Management", d: "Requests, multi-level approvals, balance tracking." },
              { t: "Recruitment + AI", d: "Job posting, candidate pipeline, AI resume analyzer." },
              { t: "Hospital Operations", d: "Appointments, patient queue, doctor scheduling." },
            ].map(m => (
              <div key={m.t} className="bg-card p-6">
                <h3 className="font-display text-lg font-semibold">{m.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="hospital" className="px-6 pb-24">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-gradient-hero p-12 text-center shadow-elegant md:p-16">
          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">Ready to modernize your hospital workforce?</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">Spin up a workspace in under a minute. No credit card required.</p>
          <Link to="/auth"><Button size="lg" variant="secondary" className="mt-8">Get started free <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} VTECH WorkforceOS. Built for healthcare teams.
      </footer>
    </div>
  );
}
