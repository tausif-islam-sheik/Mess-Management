"use client";

import React, { useState } from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Phone, ShieldCheck, Sparkles, User, KeyRound, LogIn, ArrowRight } from "lucide-react";

export const LoginView: React.FC = () => {
  const { login, users } = useMess();
  const { t } = useLanguage();

  const [phone, setPhone] = useState("+8801711223344");
  const [pin, setPin] = useState("1234");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await login(phone, pin);
    if (!success) {
      setError("Invalid phone number or PIN. Try one of the demo accounts below!");
    }
  };

  const handleQuickLogin = (uPhone: string) => {
    login(uPhone, "1234");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-3xl shadow-xl shadow-emerald-950/60 mb-1">
            🍽️
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Shanti Nibash Hostel Mess</h1>
          <p className="text-xs text-slate-400">Sign in with your registered phone number & 4-digit PIN</p>
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
                  <Phone className="h-3.5 w-3.5 text-emerald-400" /> Phone Number / Mobile
                </label>
                <Input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+8801XXXXXXXXX"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-cyan-400" /> 4-Digit Security PIN
                </label>
                <Input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  required
                />
              </div>

              <Button type="submit" variant="emerald" className="w-full h-11 text-sm font-bold shadow-lg shadow-emerald-950/50">
                Log In to Mess Dashboard <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>

            {/* Quick Demo Login Presets */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
                Instant Demo 1-Click Login:
              </p>
              <div className="space-y-2">
                {users.slice(0, 3).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u.phone)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-800 hover:border-slate-700 transition-all text-xs text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                        alt={u.name}
                        className="h-7 w-7 rounded-full border border-slate-700 object-cover"
                      />
                      <div>
                        <div className="font-bold text-white text-xs">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.phone}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {u.role.replace("_", " ")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
