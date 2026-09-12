"use client";

import React from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart as PieIcon, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const pieConfig = {
  bazar: { label: "Bazar Groceries", color: "#10b981" },
  utility: { label: "Utility & Misc", color: "#a855f7" },
} satisfies ChartConfig;

const barConfig = {
  MealCost: { label: "Meal Share", color: "#10b981" },
  UtilityShare: { label: "Utility Share", color: "#a855f7" },
  Deposited: { label: "Deposits Paid", color: "#06b6d4" },
} satisfies ChartConfig;

const formatTaka = (value: unknown) =>
  `৳${Number(value ?? 0).toLocaleString()}`;

export const ExpenseChart: React.FC = () => {
  const { bazarCosts, utilityCosts, memberSummaries } = useMess();
  const { t } = useLanguage();

  const totalBazar = bazarCosts.reduce((a, b) => a + b.amount, 0);
  const totalUtility = utilityCosts.reduce((a, b) => a + b.amount, 0);

  const pieData = [
    { name: "bazar", value: totalBazar, fill: "var(--color-bazar)" },
    { name: "utility", value: totalUtility, fill: "var(--color-utility)" },
  ];

  const barData = memberSummaries.map((m) => ({
    name: m.user.name.split(" ")[0],
    MealCost: Math.round(m.bazarCostShare),
    UtilityShare: Math.round(m.utilityShare),
    Deposited: Math.round(m.totalDeposited),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Category Pie Chart */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-emerald-400" />
            Cost Distribution
          </CardTitle>
          <CardDescription>Bazar vs utility split</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pieConfig} className="h-64 w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel formatter={formatTaka} />} />
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Member Cost vs Deposit Bar Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-cyan-400" />
            {t.dashboard.expenseTrend} (Per Member Breakdown)
          </CardTitle>
          <CardDescription>Meal share, utility share & deposits per member</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="h-64 w-full">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent formatter={formatTaka} />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="MealCost" fill="var(--color-MealCost)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="UtilityShare" fill="var(--color-UtilityShare)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Deposited" fill="var(--color-Deposited)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
