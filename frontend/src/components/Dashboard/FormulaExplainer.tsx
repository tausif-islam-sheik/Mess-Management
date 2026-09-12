"use client";

import React from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, Equal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const FormulaExplainer: React.FC = () => {
  const { totalBazarCost, totalMeals, mealRate } = useMess();
  const { t } = useLanguage();

  return (
    <Card className="mb-6 bg-slate-900/90 border border-slate-800">
      <CardHeader>
        <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-cyan-400" />
          {t.dashboard.formulaTitle}
        </CardTitle>
        <CardDescription>
          Guest meals are included in total meals. Utilities & extra charges are
          split equally among all members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-center md:text-left">
          <div className="flex-1">
            <p className="text-xs text-slate-400 font-medium">{t.dashboard.formulaSubtitle}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Guest meals are included in total meals. Utilities & extra charges are split equally among all members.
            </p>
          </div>

          <Separator orientation="vertical" className="hidden md:block self-stretch bg-slate-800" />

          <div className="flex items-center gap-3 bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 font-mono text-sm">
            <div className="text-center">
              <div className="text-xs text-slate-400 font-sans">Total Bazar</div>
              <div className="font-bold text-emerald-400">{formatCurrency(totalBazarCost)}</div>
            </div>

            <div className="text-slate-500 font-bold text-lg">÷</div>

            <div className="text-center">
              <div className="text-xs text-slate-400 font-sans">Total Meals</div>
              <div className="font-bold text-amber-400">{totalMeals} Meals</div>
            </div>

            <Equal className="h-4 w-4 text-slate-500" />

            <div className="text-center bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-500/30">
              <div className="text-xs text-cyan-300 font-sans">Meal Rate</div>
              <div className="font-bold text-cyan-400 text-base">{formatCurrency(mealRate)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
