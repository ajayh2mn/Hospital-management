import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — VTECH WorkforceOS" }, { name: "description", content: "Sign in to your VTECH WorkforceOS workspace." }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) navigate({ to: "/dashboard", replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back");
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName, org_name: orgName },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Account created — signing you in…");
  };

  const onGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) { toast.error(result.error.message ?? "Sign-in failed"); setLoading(false); }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-hero p-12 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary-foreground">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 backdrop-blur">
            <Activity className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold">VTECH WorkforceOS</span>
        </Link>
        <div className="text-primary-foreground">
          <h2 className="max-w-md font-display text-4xl font-bold leading-tight">
            "We replaced three vendors with one workspace."
          </h2>
          <p className="mt-3 max-w-md text-primary-foreground/80">— HR Director, 800-bed multi-specialty hospital</p>
        </div>
        <div className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} VTECH</div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md border-border/60 shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Welcome</CardTitle>
            <CardDescription>Sign in or create your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={onSignIn} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="se">Email</Label>
                    <Input id="se" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sp">Password</Label>
                    <Input id="sp" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-hero shadow-elegant">Sign in</Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={onSignUp} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fn">Full name</Label>
                    <Input id="fn" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Dr. Priya Sharma" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="on">Organization</Label>
                    <Input id="on" required value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Apollo Hospital" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ue">Email</Label>
                    <Input id="ue" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="up">Password</Label>
                    <Input id="up" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-hero shadow-elegant">Create workspace</Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={onGoogle} disabled={loading}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"/><path fill="#FBBC05" d="M5.84 14.1A6.96 6.96 0 0 1 5.47 12c0-.73.13-1.44.36-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38Z"/></svg>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
