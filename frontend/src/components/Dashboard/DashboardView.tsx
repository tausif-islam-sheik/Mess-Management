"use client";

import React from "react";
import Link from "next/link";
import { OverviewCards } from "./OverviewCards";
import { FormulaExplainer } from "./FormulaExplainer";
import { ExpenseChart } from "./ExpenseChart";
import { MemberTable } from "./MemberTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { useMess } from "@/context/MessContext";
import { Vote, ShoppingBag, PlusCircle } from "lucide-react";

export const DashboardView: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser } = useMess();

  return (
    <div className="space-y-6 pt-4 pr-1 sm:pr-2 animate-in fade-in duration-300">
      {/* Header Banner */}
      <Card className="mt-2 mr-1 border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 shadow-xl">
        <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              Welcome back, {currentUser.name}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 flex flex-wrap items-center gap-2">
              Active Role:
              <Badge variant="emerald">{currentUser.role.replace("_", " ")}</Badge>
              <span>Here is your real-time mess balance summary.</span>
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-2.5 mt-4 sm:mt-1 sm:pt-2 sm:pl-4 pr-2">
            <Button asChild variant="emerald" size="sm" className="flex items-center gap-1.5">
              <Link href="/polls">
                <Vote className="h-4 w-4" /> {t.dashboard.createPoll}
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm" className="flex items-center gap-1.5">
              <Link href="/costs">
                <ShoppingBag className="h-4 w-4 text-emerald-400" /> {t.dashboard.addExpense}
              </Link>
            </Button>

            <Button asChild variant="secondary" size="sm" className="flex items-center gap-1.5">
              <Link href="/deposits">
                <PlusCircle className="h-4 w-4 text-cyan-400" /> {t.dashboard.addDeposit}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <OverviewCards />

      {/* Dynamic Meal Rate Formula Explainer */}
      <FormulaExplainer />

      {/* Expense Charts */}
      <ExpenseChart />

      {/* Member Meals & Net Balance Summary */}
      <MemberTable />
    </div>
  );
};
