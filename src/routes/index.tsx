import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Input } from "@/components/ui-kit";
import { isLoggedIn, login } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Login,
  head: () => ({
    meta: [
      { title: "Login | MediCare Hospital Management" },
      { name: "description", content: "Sign in to the MediCare Hospital management system to manage patients, doctors, appointments, pharmacy and billing." },
      { property: "og:title", content: "Login | MediCare Hospital Management" },
      { property: "og:description", content: "Secure staff sign-in for the MediCare Hospital management dashboard." },
    ],
  }),
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@medicare-hospital.com");
  const [password, setPassword] = useState("medicare123");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoggedIn()) navigate({ to: "/dashboard" });
  }, [navigate]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-brand p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-card/15">
            <Activity className="h-6 w-6" />
          </div>
          <span className="text-lg font-semibold">MediCare Hospital</span>
        </div>
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight">
            Care coordination for every ward, in one place.
          </h1>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            Patients, doctors, appointments, pharmacy stock and billing — managed from a single dashboard.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            ["1,284", "Patients"],
            ["68", "Doctors"],
            ["24/7", "Emergency"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-xl bg-card/10 p-4">
              <p className="text-xl font-semibold">{v}</p>
              <p className="text-primary-foreground/70">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <form
          className="w-full max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim() || !password.trim()) {
              setError("Please enter both your email and password.");
              return;
            }
            login(email.trim());
            navigate({ to: "/dashboard" });
          }}
        >
          <div className="mb-8 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Staff sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use the demo credentials below to continue.</p>

          <div className="mt-7 space-y-4">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                type="email"
                placeholder="Username or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>

          <p className="mt-6 rounded-xl bg-secondary p-3 text-center text-xs text-muted-foreground">
            Demo access: admin@medicare-hospital.com / medicare123
          </p>
        </form>
      </div>
    </div>
  );
}
