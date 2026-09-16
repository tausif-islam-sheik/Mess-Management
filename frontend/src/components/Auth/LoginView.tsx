"use client";

import React, { useState } from "react";
import { useMess } from "@/context/MessContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, KeyRound, LogIn, ArrowRight, ShieldCheck } from "lucide-react";

export const LoginView: React.FC = () => {
  const { login } = useMess();

  const [email, setEmail] = useState("admin@messmanager.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await login(email, password);
    if (!success) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center mb-1">
            <img src="/logo.svg" alt="MessManager logo" className="h-14 w-14 rounded-2xl shadow-xl shadow-emerald-950/60" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Shanti Nibash Hostel Mess</h1>
          <p className="text-xs text-slate-400">Sign in with your registered email & password</p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <CardHeader className="p-0 mb-6 border-b border-slate-800 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <LogIn className="h-5 w-5 text-emerald-400" /> Member & Manager Portal Login
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-emerald-400" /> Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-cyan-400" /> Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" variant="emerald" className="w-full h-11 text-sm font-bold shadow-lg shadow-emerald-950/50">
                Log In to Mess Dashboard <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-6 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="text-slate-400 font-bold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Default Super Admin:
              </div>
              <div className="text-[11px] text-slate-300 font-mono">Email: admin@messmanager.com</div>
              <div className="text-[11px] text-slate-300 font-mono">Password: Admin@123</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
