"use client";

import React from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download, Share2, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { exportMonthlyReportToExcel } from "@/lib/excel";
import { exportMonthlyReportToPDF } from "@/lib/pdf";
import { generateReportWhatsAppLink } from "@/lib/whatsapp";
import { formatCurrency } from "@/lib/utils";

export const ReportsView: React.FC = () => {
  const {
    mess,
    totalBazarCost,
    totalMeals,
    mealRate,
    totalUtilityCost,
    memberSummaries,
    bazarCosts,
    utilityCosts,
  } = useMess();
  const { t } = useLanguage();

  const monthYear = "September 2026";

  const handleExcelDownload = () => {
    exportMonthlyReportToExcel(
      monthYear,
      mess.name,
      totalBazarCost,
      totalMeals,
      mealRate,
      totalUtilityCost,
      memberSummaries,
      bazarCosts,
      utilityCosts
    );
  };

  const handlePdfDownload = () => {
    exportMonthlyReportToPDF(
      monthYear,
      mess.name,
      totalBazarCost,
      totalMeals,
      mealRate,
      totalUtilityCost,
      memberSummaries
    );
  };

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
            {t.reports.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">{t.reports.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="emerald" onClick={handleExcelDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" /> {t.reports.downloadExcel}
          </Button>

          <Button variant="outline" onClick={handlePdfDownload} className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-400" /> {t.reports.downloadPdf}
          </Button>

          <a
            href={generateReportWhatsAppLink(monthYear, currentOrigin)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <Share2 className="h-4 w-4" /> Broadcast Report on WhatsApp
          </a>
        </div>
      </div>

      {/* Statement Summary Card */}
      <Card className="bg-slate-900/90 border-slate-800 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Verified Monthly Statement
            </span>
            <h3 className="text-xl font-bold text-white mt-1">{monthYear} Final Audit</h3>
            <p className="text-xs text-slate-400">Mess: {mess.name}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Total Bazar</div>
              <div className="text-sm font-extrabold text-emerald-400">{formatCurrency(totalBazarCost)}</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Total Meals</div>
              <div className="text-sm font-extrabold text-amber-400">{totalMeals}</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Meal Rate</div>
              <div className="text-sm font-extrabold text-cyan-400">{formatCurrency(mealRate)}</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Utility Cost</div>
              <div className="text-sm font-extrabold text-purple-400">{formatCurrency(totalUtilityCost)}</div>
            </div>
          </div>
        </div>

        {/* Member Monthly Breakdown Preview */}
        <div className="pt-6">
          <h4 className="text-sm font-bold text-slate-200 mb-4">Member Financial Summary</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3 text-right">Meals</th>
                  <th className="py-2.5 px-3 text-right">Meal Cost</th>
                  <th className="py-2.5 px-3 text-right">Utility Share</th>
                  <th className="py-2.5 px-3 text-right">Deposited</th>
                  <th className="py-2.5 px-3 text-right">Net Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {memberSummaries.map((m) => (
                  <tr key={m.user.id}>
                    <td className="py-2.5 px-3 text-white font-bold">{m.user.name}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{m.totalMeals}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">{formatCurrency(m.bazarCostShare)}</td>
                    <td className="py-2.5 px-3 text-right text-purple-400">{formatCurrency(m.utilityShare)}</td>
                    <td className="py-2.5 px-3 text-right text-cyan-400">{formatCurrency(m.totalDeposited)}</td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      <span className={m.netBalance >= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {m.netBalance >= 0 ? `+${formatCurrency(m.netBalance)}` : formatCurrency(m.netBalance)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};
