"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface StatItem {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  color: string;
}

/** Dashboard-style gradient metric cards, reused across all pages. */
export const StatsCards: React.FC<{ items: StatItem[] }> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map((m, idx) => {
        const Icon = m.icon;
        return (
          <Card key={idx} className={`bg-gradient-to-br ${m.color} border py-3 gap-0 transition-transform hover:-translate-y-0.5`}>
            <CardContent className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{m.title}</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{m.value}</h2>
                {m.subtext && (
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    {m.subtext}
                  </p>
                )}
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
