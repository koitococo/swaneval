"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import type { TokenResponse, User } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [regForm, setRegForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      router.replace("/");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data: tokenData } = await api.post<TokenResponse>(
        "/auth/login",
        loginForm
      );
      localStorage.setItem("token", tokenData.access_token);
      const { data: user } = await api.get<User>("/auth/me");
      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = "/";
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : undefined;
      setError(detail || "Invalid username or password");
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.post("/auth/register", { ...regForm, role: "engineer" });
      setSuccess("Account created. Sign in below.");
      setMode("login");
      setLoginForm({
        username: regForm.username,
        password: regForm.password,
      });
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : undefined;
      setError(detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — animated gradient background */}
      <div className="hidden lg:block lg:w-1/2 login-bg">
        {/* Blob element for the third animated gradient layer */}
        <div className="blob" />

        {/* App name pinned to bottom-left */}
        <div className="relative z-10 flex flex-col justify-end h-full p-10">
          <h1 className="text-4xl font-bold text-white/90 tracking-tight leading-none">
            EvalScope
          </h1>
          <p className="text-sm text-white/40 mt-2">
            LLM Evaluation Platform
          </p>
        </div>
      </div>

      {/* Right — plain form panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile-only brand */}
          <div className="lg:hidden">
            <h1 className="text-2xl font-bold tracking-tight">EvalScope</h1>
          </div>

          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {mode === "login" ? "Sign in" : "Create account"}
            </h2>
            <p className="text-muted-foreground mt-1">
              {mode === "login"
                ? "Enter your credentials to continue."
                : "Register a new account to get started."}
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  autoComplete="username"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  className="h-10 focus-visible:ring-primary/40"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  className="h-10 focus-visible:ring-primary/40"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-10" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                No account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-primary font-medium hover:underline underline-offset-4"
                >
                  Register
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reg-user">Username</Label>
                <Input
                  id="reg-user"
                  autoComplete="username"
                  value={regForm.username}
                  onChange={(e) =>
                    setRegForm({ ...regForm, username: e.target.value })
                  }
                  className="h-10 focus-visible:ring-primary/40"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={regForm.email}
                  onChange={(e) =>
                    setRegForm({ ...regForm, email: e.target.value })
                  }
                  className="h-10 focus-visible:ring-primary/40"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-pass">Password</Label>
                <Input
                  id="reg-pass"
                  type="password"
                  autoComplete="new-password"
                  value={regForm.password}
                  onChange={(e) =>
                    setRegForm({ ...regForm, password: e.target.value })
                  }
                  className="h-10 focus-visible:ring-primary/40"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-10" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-primary font-medium hover:underline underline-offset-4"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
