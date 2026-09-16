"use client";

import React, { useState } from "react";
import { useMess } from "@/context/MessContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, KeyRound, ArrowRight, UserCheck } from "lucide-react";

interface MemberLoginProps {
  onSwitchToAdmin: () => void;
}

export const MemberLoginView: React.FC<MemberLoginProps> = ({ onSwitchToAdmin }) => {
  const { loginMember } = useMess();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await loginMember(email, password);
    if (!success) {
      setError("No account found for this email. Please contact your Mess Manager to enroll your email address.");
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900/90 shadow-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="p-0 mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-emerald-400" /> Member & Manager Login
          </CardTitle>
          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Mess Portal
          </span>
        </div>
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

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <button
            onClick={onSwitchToAdmin}
            className="text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5"
          >
            Are you a Super Admin? <span className="text-cyan-400 underline">Super Admin Login Portal →</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
