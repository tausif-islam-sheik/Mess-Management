"use client";

import React from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { Shield, Globe, Wallet, LogOut } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const Navbar: React.FC = () => {
  const { currentUser, mess, memberSummaries, isAuthenticated, logout } = useMess();
  const { lang, setLang, t } = useLanguage();

  const mySummary = memberSummaries.find((m) => m.user.id === currentUser.id);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl px-6 py-3 sm:px-8">
      <div className="flex w-full items-center justify-between gap-6">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          {mess.logoUrl ? (
            <img
              src={mess.logoUrl}
              alt="Mess logo"
              className="h-10 w-10 rounded-xl border border-slate-700 object-cover"
            />
          ) : (
            <img
              src="/logo.svg"
              alt="MessManager logo"
              className="h-10 w-10 rounded-xl shadow-lg shadow-emerald-950/60"
            />
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              {mess.name}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">{t.appSubtitle}</p>
          </div>
        </div>

        {/* Right Actions & Switches */}
        <div className="flex items-center gap-3 sm:gap-5 mr-6">
          {/* User Net Balance Badge */}
          {isAuthenticated && mySummary && (
            <div className="hidden md:flex items-center gap-2.5 rounded-lg bg-slate-900 border border-slate-800 px-4 py-2 text-xs">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-400">{t.dashboard.myBalance}</div>
                <div className={`font-bold ${mySummary.netBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {mySummary.netBalance >= 0 ? `+${formatCurrency(mySummary.netBalance)}` : formatCurrency(mySummary.netBalance)}
                </div>
              </div>
            </div>
          )}

          {/* Role Display */}
          {isAuthenticated && (
            <div className="relative hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-200 font-medium py-1">
                {t.roles[currentUser.role]}
              </span>
            </div>
          )}

          {/* Language Toggle Button */}
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors"
            title="Toggle Bangla / English"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-400" />
            {lang === "en" ? "বাংলা" : "English"}
          </button>

          {/* Logout / Login Button */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 border-rose-500/20 transition-colors"
              title="Log Out of Session"
            >
              <LogOut className="h-3.5 w-3.5" /> Log Out
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
