"use client";

import React from "react";
import { OverviewCards } from "./OverviewCards";
import { ExpenseChart } from "./ExpenseChart";
import { MemberTable } from "./MemberTable";
import { useLanguage } from "@/context/LanguageContext";
import { useDashboardSettings } from "@/lib/dashboard-settings";
import { LayoutDashboard } from "lucide-react";

export const DashboardView: React.FC = () => {
  const { t } = useLanguage();
  const { settings } = useDashboardSettings();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-emerald-400" />
          {t.dashboard.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">Here is your real-time mess balance summary.</p>
      </div>

      {/* Metrics Cards */}
      {settings.showStats && <OverviewCards />}

      {/* Expense Charts */}
      {settings.showChart && <ExpenseChart />}

      {/* Member Meals & Net Balance Summary */}
      {settings.showMembers && <MemberTable />}
    </div>
  );
};
