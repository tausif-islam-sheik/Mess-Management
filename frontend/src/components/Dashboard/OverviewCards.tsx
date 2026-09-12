"use client";

import React from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Utensils, ShoppingCart, Calculator, Zap, TrendingUp } from "lucide-react";

export const OverviewCards: React.FC = () => {
  const { totalMeals, totalBazarCost, mealRate, totalUtilityCost, users } = useMess();
  const { t } = useLanguage();

  const metrics = [
    {
      title: t.dashboard.totalMeals,
      value: totalMeals.toString(),
      subtext: `${users.length} Active Members`,
      icon: Utensils,
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
    },
    {
      title: t.dashboard.totalBazar,
      value: formatCurrency(totalBazarCost),
      subtext: "Groceries & Daily Food",
      icon: ShoppingCart,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    },
    {
      title: t.dashboard.mealRate,
      value: formatCurrency(mealRate),
      subtext: "Per Meal Cost",
      icon: Calculator,
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
    },
    {
      title: t.dashboard.totalUtility,
      value: formatCurrency(totalUtilityCost),
      subtext: "Electricity, Gas, Wifi",
      icon: Zap,
      color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <Card key={idx} className={`bg-gradient-to-br ${m.color} border transition-transform hover:-translate-y-0.5`}>
            <CardContent className="flex items-center justify-between gap-3 p-5">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{m.title}</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{m.value}</h2>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  {m.subtext}
                </p>
              </div>
              <div className="rounded-xl bg-slate-950/40 p-3 text-white border border-white/10">
                <Icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
