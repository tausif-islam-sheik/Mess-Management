"use client";

import React, { useState } from "react";
import { useMess } from "@/context/MessContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Mail, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";

interface SuperAdminLoginProps {
  onSwitchToMember: () => void;
}

export const SuperAdminLoginView: React.FC<SuperAdminLoginProps> = ({ onSwitchToMember }) => {
  const { loginSuperAdmin } = useMess();
  const [email, setEmail] = useState("admin@messmanager.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await loginSuperAdmin(email, password);
    if (!success) {
      setError("Invalid Super Admin credentials. Use admin@messmanager.com with password Admin@123.");
    }
  };

  return (
    <Card className="border-indigo-500/40 bg-slate-900/90 shadow-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="p-0 mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-400" /> Super Admin Portal Login
          </CardTitle>
          <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
            System Control
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
              <Mail className="h-3.5 w-3.5 text-indigo-400" /> Admin Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@messmanager.com"
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

          <Button type="submit" variant="emerald" className="w-full h-11 text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-950/50">
            Enter Super Admin Console <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        {/* Super Admin Preset Helper */}
        <div className="mt-5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
          <div className="text-slate-400 font-bold flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> Default Super Admin Credentials:
          </div>
          <div className="text-[11px] text-slate-300 font-mono">Email: admin@messmanager.com</div>
          <div className="text-[11px] text-slate-300 font-mono">Password: Admin@123</div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <button
            onClick={onSwitchToMember}
            className="text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
          >
            Looking for Mess Portal? <span className="text-emerald-400 underline">Member / Manager Login →</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
