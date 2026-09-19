"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  FileSpreadsheet,
  Download,
  Share2,
  FileText,
  ShoppingCart,
  Utensils,
  Calculator,
  Zap,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { exportMonthlyReportToExcel } from "@/lib/excel";
import { exportMonthlyReportToPDF } from "@/lib/pdf";
import { formatCurrency } from "@/lib/utils";
import { StatsCards } from "@/components/Dashboard/StatsCards";
import {
  ReportColumn,
  ReportValues,
  loadReportColumns,
  saveReportColumns,
  loadReportValues,
  saveReportValues,
} from "@/lib/monthly-report";

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

  // ----- Custom columns (added to the existing table) -----
  const [columns, setColumns] = useState<ReportColumn[]>([]);
  const [values, setValues] = useState<ReportValues>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setColumns(loadReportColumns());
    setValues(loadReportValues());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveReportColumns(columns);
  }, [columns, hydrated]);
  useEffect(() => {
    if (hydrated) saveReportValues(values);
  }, [values, hydrated]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [editingCol, setEditingCol] = useState<ReportColumn | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteCol, setDeleteCol] = useState<ReportColumn | null>(null);

  const setCell = (userId: string, columnId: string, amount: number) => {
    setValues((prev) => ({
      ...prev,
      [userId]: { ...(prev[userId] ?? {}), [columnId]: amount },
    }));
  };

  const customTotalFor = (userId: string) =>
    columns.reduce((s, c) => s + (Number(values[userId]?.[c.id]) || 0), 0);

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setColumns((prev) => [...prev, { id: `col_${Date.now().toString(36)}`, title }]);
    setNewTitle("");
    setIsAddOpen(false);
  };

  const handleRenameColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCol || !editTitle.trim()) return;
    setColumns((prev) => prev.map((c) => (c.id === editingCol.id ? { ...c, title: editTitle.trim() } : c)));
    setEditingCol(null);
  };

  const handleDeleteColumn = () => {
    if (!deleteCol) return;
    const id = deleteCol.id;
    setColumns((prev) => prev.filter((c) => c.id !== id));
    setValues((prev) => {
      const next: ReportValues = {};
      Object.entries(prev).forEach(([uid, row]) => {
        const copy = { ...row };
        delete copy[id];
        next[uid] = copy;
      });
      return next;
    });
    setDeleteCol(null);
  };

  const totals = useMemo(() => {
    const perColumn: Record<string, number> = {};
    columns.forEach((c) => {
      perColumn[c.id] = memberSummaries.reduce(
        (s, m) => s + (Number(values[m.user.id]?.[c.id]) || 0),
        0
      );
    });
    return perColumn;
  }, [columns, values, memberSummaries]);

  // ----- Exports (existing behaviour) -----
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
          <button
            type="button"
            disabled
            title="WhatsApp integration coming soon"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3.5 py-2 text-xs font-bold text-slate-500 cursor-not-allowed opacity-70"
          >
            <Share2 className="h-4 w-4" /> Broadcast Report on WhatsApp
            <span className="rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] px-1.5 py-0.5 font-bold">
              Coming Soon
            </span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards
        items={[
          {
            title: "Total Bazar",
            value: formatCurrency(totalBazarCost),
            subtext: `${bazarCosts.length} entries`,
            icon: ShoppingCart,
            color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
          },
          {
            title: "Total Meals",
            value: String(totalMeals),
            subtext: `${memberSummaries.length} members`,
            icon: Utensils,
            color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
          },
          {
            title: "Meal Rate",
            value: formatCurrency(mealRate),
            subtext: "Per meal cost",
            icon: Calculator,
            color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
          },
          {
            title: "Utility Cost",
            value: formatCurrency(totalUtilityCost),
            subtext: `${utilityCosts.length} bills`,
            icon: Zap,
            color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400",
          },
        ]}
      />

      {/* Existing table — same columns, image layout */}
      <Card className="bg-slate-900/90 border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Verified Monthly Statement
            </span>
            <h3 className="text-xl font-bold text-white mt-1">{monthYear} Final Audit</h3>
            <p className="text-xs text-slate-400">
              Mess: {mess.name} — click any custom cell to edit. Custom columns add to Net Balance.
            </p>
          </div>
          <Button variant="emerald" onClick={() => setIsAddOpen(true)} className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Add Column
          </Button>
        </div>

        <div className="pt-6">
          <h4 className="text-sm font-bold text-slate-200 mb-4">Member Financial Summary</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3 text-right">Meals</th>
                  <th className="py-2.5 px-3 text-right">Meal Cost</th>
                  <th className="py-2.5 px-3 text-right">Utility Share</th>
                  {columns.map((c) => (
                    <th key={c.id} className="py-2.5 px-3 text-right min-w-[110px]">
                      <span className="inline-flex items-center justify-end gap-1 normal-case">
                        <span>{c.title}</span>
                        <button
                          title={`Rename ${c.title}`}
                          onClick={() => {
                            setEditingCol(c);
                            setEditTitle(c.title);
                          }}
                          className="rounded p-0.5 text-slate-500 hover:bg-slate-800 hover:text-white"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          title={`Delete ${c.title}`}
                          onClick={() => setDeleteCol(c)}
                          className="rounded p-0.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-right">Deposited</th>
                  <th className="py-2.5 px-3 text-right">Net Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {memberSummaries.map((m) => {
                  const custom = customTotalFor(m.user.id);
                  const adjustedBalance = m.netBalance - custom;
                  return (
                    <tr key={m.user.id}>
                      <td className="py-2.5 px-3 text-white font-bold whitespace-nowrap">{m.user.name}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{m.totalMeals}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">
                        {formatCurrency(m.bazarCostShare)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-purple-400">
                        {formatCurrency(m.utilityShare)}
                      </td>
                      {columns.map((c) => (
                        <td key={c.id} className="py-1 px-1 text-right">
                          <input
                            type="number"
                            min={0}
                            className="w-24 bg-slate-800/80 border border-slate-700 rounded-md text-right text-slate-100 text-xs px-2 py-1.5 outline-none focus:border-emerald-500 placeholder:text-slate-600"
                            value={values[m.user.id]?.[c.id] ?? ""}
                            placeholder="—"
                            onChange={(e) => setCell(m.user.id, c.id, parseFloat(e.target.value) || 0)}
                          />
                        </td>
                      ))}
                      <td className="py-2.5 px-3 text-right text-cyan-400">
                        {formatCurrency(m.totalDeposited)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        <span className={adjustedBalance >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {adjustedBalance >= 0
                            ? `+${formatCurrency(adjustedBalance)}`
                            : formatCurrency(adjustedBalance)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t border-slate-800 font-bold">
                  <td className="py-2.5 px-3 text-slate-200">Total</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{totalMeals}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">
                    {formatCurrency(totalBazarCost)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-purple-400">
                    {formatCurrency(totalUtilityCost)}
                  </td>
                  {columns.map((c) => (
                    <td key={c.id} className="py-2.5 px-3 text-right text-slate-300">
                      {totals[c.id] ? totals[c.id].toLocaleString() : "—"}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-right text-cyan-400">
                    {formatCurrency(memberSummaries.reduce((s, m) => s + m.totalDeposited, 0))}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-100">
                    {formatCurrency(
                      memberSummaries.reduce((s, m) => s + m.netBalance, 0) -
                        memberSummaries.reduce((s, m) => s + customTotalFor(m.user.id), 0)
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Add column */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add custom column"
        description="Adds an editable column to the existing Member Financial Summary table."
      >
        <form onSubmit={handleAddColumn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Column name</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Seat Rent"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Add Column
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Rename column */}
      <Dialog
        isOpen={!!editingCol}
        onClose={() => setEditingCol(null)}
        title="Rename column"
        description={editingCol ? `Renaming "${editingCol.title}"` : undefined}
      >
        <form onSubmit={handleRenameColumn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Column name</label>
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setEditingCol(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Save
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteCol}
        title="Delete column?"
        message={deleteCol ? `"${deleteCol.title}" and all its values will be removed.` : ""}
        onCancel={() => setDeleteCol(null)}
        onConfirm={handleDeleteColumn}
      />
    </div>
  );
};
