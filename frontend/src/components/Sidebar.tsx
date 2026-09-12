"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  LayoutDashboard,
  Vote,
  Receipt,
  Wallet,
  CalendarDays,
  FileSpreadsheet,
  History,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const pathname = usePathname();

  const navItems: { href: string; label: string; icon: React.FC<{ className?: string }> }[] = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/polls", label: t.nav.polls, icon: Vote },
    { href: "/costs", label: t.nav.costs, icon: Receipt },
    { href: "/deposits", label: t.nav.deposits, icon: Wallet },
    { href: "/roster", label: t.nav.roster, icon: CalendarDays },
    { href: "/reports", label: t.nav.reports, icon: FileSpreadsheet },
    { href: "/audit", label: t.nav.audit, icon: History },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-950 p-4 fixed left-0 top-[65px] h-[calc(100vh-65px)] overflow-y-auto z-30">
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  active
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/40"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer info card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3.5 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            WhatsApp Integration Active
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Automated daily meal polls & monthly report exports ready.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-2 py-2 lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-medium transition-colors ${
                active ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
