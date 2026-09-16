"use client";

import React from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { StatsCards } from "./StatsCards";
import { formatCurrency } from "@/lib/utils";
import { Utensils, ShoppingCart, Calculator, Zap } from "lucide-react";

export const OverviewCards: React.FC = () => {
  const { totalMeals, totalBazarCost, mealRate, totalUtilityCost, users } = useMess();
  const { t } = useLanguage();

  return (
    <StatsCards
      items={[
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
      ]}
    />
  );
};
