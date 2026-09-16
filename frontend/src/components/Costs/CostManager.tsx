"use client";

import React, { useState } from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Zap, Plus, Image as ImageIcon, ExternalLink, Calendar, User, DollarSign, Receipt } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CostCategory, BazarCost, UtilityCost } from "@/lib/types";
import { StatsCards } from "@/components/Dashboard/StatsCards";
import { RowActions } from "@/components/ui/row-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export const CostManager: React.FC = () => {
  const { bazarCosts, utilityCosts, addBazarCost, updateBazarCost, deleteBazarCost, addUtilityCost, updateUtilityCost, deleteUtilityCost, users, currentUser, totalBazarCost, totalUtilityCost } = useMess();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<"bazar" | "utility">("bazar");
  const [isBazarModalOpen, setIsBazarModalOpen] = useState(false);
  const [isUtilityModalOpen, setIsUtilityModalOpen] = useState(false);
  const [viewReceipt, setViewReceipt] = useState<string | null>(null);

  // Bazar Form
  const [bazarAmount, setBazarAmount] = useState("");
  const [bazarDesc, setBazarDesc] = useState("");
  const [bazarPayer, setBazarPayer] = useState(currentUser.id);
  const [bazarReceipt, setBazarReceipt] = useState("");

  // Utility Form
  const [utilityTitle, setUtilityTitle] = useState("");
  const [utilityAmount, setUtilityAmount] = useState("");
  const [utilityCategory, setUtilityCategory] = useState<CostCategory>("UTILITY");
  const [utilityPayer, setUtilityPayer] = useState(currentUser.id);

  // Edit / Delete state
  const [editingBazar, setEditingBazar] = useState<BazarCost | null>(null);
  const [editBazarAmount, setEditBazarAmount] = useState("");
  const [editBazarDesc, setEditBazarDesc] = useState("");
  const [editBazarPayer, setEditBazarPayer] = useState("");
  const [deleteBazarId, setDeleteBazarId] = useState<string | null>(null);
  const [editingUtility, setEditingUtility] = useState<UtilityCost | null>(null);
  const [editUtilityTitle, setEditUtilityTitle] = useState("");
  const [editUtilityAmount, setEditUtilityAmount] = useState("");
  const [editUtilityCategory, setEditUtilityCategory] = useState<CostCategory>("UTILITY");
  const [editUtilityPayer, setEditUtilityPayer] = useState("");
  const [deleteUtilityId, setDeleteUtilityId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const openEditBazar = (item: BazarCost) => {
    setEditingBazar(item);
    setEditBazarAmount(String(item.amount));
    setEditBazarDesc(item.description);
    setEditBazarPayer(item.paidById);
    setFormError("");
  };

  const handleEditBazarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBazar) return;
    const amountNum = parseFloat(editBazarAmount);
    if (!amountNum || amountNum <= 0) return;
    setFormError("");
    try {
      await updateBazarCost(editingBazar.id, {
        amount: amountNum,
        description: editBazarDesc,
        paidById: editBazarPayer,
      });
      setEditingBazar(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update entry.");
    }
  };

  const openEditUtility = (item: UtilityCost) => {
    setEditingUtility(item);
    setEditUtilityTitle(item.title);
    setEditUtilityAmount(String(item.amount));
    setEditUtilityCategory(item.category);
    setEditUtilityPayer(item.paidById);
    setFormError("");
  };

  const handleEditUtilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUtility) return;
    const amountNum = parseFloat(editUtilityAmount);
    if (!amountNum || amountNum <= 0) return;
    setFormError("");
    try {
      await updateUtilityCost(editingUtility.id, {
        title: editUtilityTitle,
        amount: amountNum,
        category: editUtilityCategory,
        paidById: editUtilityPayer,
      });
      setEditingUtility(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update entry.");
    }
  };

  const handleBazarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(bazarAmount);
    if (!amountNum || amountNum <= 0) return;

    addBazarCost(amountNum, bazarDesc, bazarPayer, bazarReceipt);
    setIsBazarModalOpen(false);
    setBazarAmount("");
    setBazarDesc("");
  };

  const handleUtilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(utilityAmount);
    if (!amountNum || amountNum <= 0) return;

    addUtilityCost(utilityTitle, amountNum, utilityCategory, utilityPayer);
    setIsUtilityModalOpen(false);
    setUtilityTitle("");
    setUtilityAmount("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-emerald-400" />
            {t.costs.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Log market groceries, gas, electricity, and shared house repair expenses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "bazar" ? (
            <Button variant="emerald" onClick={() => setIsBazarModalOpen(true)} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> {t.costs.addBazar}
            </Button>
          ) : (
            <Button variant="emerald" onClick={() => setIsUtilityModalOpen(true)} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> {t.costs.addUtility}
            </Button>
          )}
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
            title: "Total Utility",
            value: formatCurrency(totalUtilityCost),
            subtext: `${utilityCosts.length} entries`,
            icon: Zap,
            color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400",
          },
          {
            title: "Combined Spend",
            value: formatCurrency(totalBazarCost + totalUtilityCost),
            subtext: "Bazar + Utility",
            icon: DollarSign,
            color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
          },
          {
            title: "Total Entries",
            value: String(bazarCosts.length + utilityCosts.length),
            subtext: "Logged expenses",
            icon: Receipt,
            color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
          },
        ]}
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab("bazar")}
          className={`pb-3 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "bazar"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          {t.costs.bazarCosts} ({bazarCosts.length})
        </button>

        <button
          onClick={() => setActiveTab("utility")}
          className={`pb-3 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "utility"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Zap className="h-4 w-4" />
          {t.costs.utilityCosts} ({utilityCosts.length})
        </button>
      </div>

      {/* Bazar Costs Table */}
      {activeTab === "bazar" && (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Paid By</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3 text-center">Receipt</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {bazarCosts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-slate-300 font-mono flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        {formatDate(item.date)}
                      </td>
                      <td className="py-3 px-3 text-white font-semibold">{item.description}</td>
                      <td className="py-3 px-3 text-slate-300">
                        <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-lg text-emerald-400 font-medium">
                          <User className="h-3 w-3" /> {item.paidByName || "Member"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-400 text-sm">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.receiptUrl ? (
                          <button
                            onClick={() => setViewReceipt(item.receiptUrl!)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:underline bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20"
                          >
                            <ImageIcon className="h-3 w-3" /> Proof
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[10px]">No Receipt</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <RowActions onEdit={() => openEditBazar(item)} onDelete={() => setDeleteBazarId(item.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Utility Costs Table */}
      {activeTab === "utility" && (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Month</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Title / Item</th>
                    <th className="py-3 px-3">Paid By</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {utilityCosts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-slate-300 font-mono">{item.month}</td>
                      <td className="py-3 px-3">
                        <Badge variant={item.category === "UTILITY" ? "indigo" : "amber"}>
                          {item.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-white font-semibold">{item.title}</td>
                      <td className="py-3 px-3 text-slate-300">
                        <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-lg text-purple-400 font-medium">
                          <User className="h-3 w-3" /> {item.paidByName || "Member"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-purple-400 text-sm">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-3 px-3">
                        <RowActions onEdit={() => openEditUtility(item)} onDelete={() => setDeleteUtilityId(item.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Add Bazar Cost */}
      <Dialog
        isOpen={isBazarModalOpen}
        onClose={() => setIsBazarModalOpen(false)}
        title={t.costs.addBazar}
        description="Log grocery purchases to automatically recalculate the mess meal rate."
      >
        <form onSubmit={handleBazarSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.costs.amount} (BDT ৳)</label>
            <Input type="number" step="0.01" value={bazarAmount} onChange={(e) => setBazarAmount(e.target.value)} placeholder="e.g. 1450" required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.costs.description}</label>
            <Input type="text" value={bazarDesc} onChange={(e) => setBazarDesc(e.target.value)} placeholder="e.g. Rice 25kg, Oil 5L, Potato 5kg" required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.costs.paidBy}</label>
            <Select value={bazarPayer} onChange={(e) => setBazarPayer(e.target.value)}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Receipt Image URL (Optional)</label>
            <Input type="url" value={bazarReceipt} onChange={(e) => setBazarReceipt(e.target.value)} placeholder="https://..." />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsBazarModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Save Bazar Cost
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal Add Utility Cost */}
      <Dialog
        isOpen={isUtilityModalOpen}
        onClose={() => setIsUtilityModalOpen(false)}
        title={t.costs.addUtility}
        description="Log shared electricity, gas, wifi, or house maintenance bills."
      >
        <form onSubmit={handleUtilitySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title / Item</label>
            <Input type="text" value={utilityTitle} onChange={(e) => setUtilityTitle(e.target.value)} placeholder="e.g. DESCO Electricity Bill" required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.costs.amount} (BDT ৳)</label>
            <Input type="number" step="0.01" value={utilityAmount} onChange={(e) => setUtilityAmount(e.target.value)} placeholder="e.g. 3500" required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <Select value={utilityCategory} onChange={(e) => setUtilityCategory(e.target.value as CostCategory)}>
              <option value="UTILITY">Utility (Electricity, Gas, Water, Wifi)</option>
              <option value="REPAIR">Repair & Maintenance</option>
              <option value="OTHER">Other / Miscellaneous</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.costs.paidBy}</label>
            <Select value={utilityPayer} onChange={(e) => setUtilityPayer(e.target.value)}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsUtilityModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Save Utility Cost
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal View Receipt */}
      <Dialog isOpen={!!viewReceipt} onClose={() => setViewReceipt(null)} title="Receipt Proof Photo">
        <div className="space-y-4 text-center">
          {viewReceipt && (
            <img src={viewReceipt} alt="Receipt Proof" className="max-h-96 w-full object-contain rounded-xl border border-slate-800" />
          )}
          <Button variant="outline" onClick={() => setViewReceipt(null)}>
            Close
          </Button>
        </div>
      </Dialog>

      {/* Modal Edit Bazar Cost */}
      <Dialog isOpen={!!editingBazar} onClose={() => setEditingBazar(null)} title="Edit Bazar Cost" description="Update this grocery expense entry.">
        <form onSubmit={handleEditBazarSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (BDT ৳)</label>
            <Input type="number" step="0.01" value={editBazarAmount} onChange={(e) => setEditBazarAmount(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <Input type="text" value={editBazarDesc} onChange={(e) => setEditBazarDesc(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Paid By</label>
            <Select value={editBazarPayer} onChange={(e) => setEditBazarPayer(e.target.value)}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setEditingBazar(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal Edit Utility Cost */}
      <Dialog isOpen={!!editingUtility} onClose={() => setEditingUtility(null)} title="Edit Utility Cost" description="Update this shared bill entry.">
        <form onSubmit={handleEditUtilitySubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title / Item</label>
            <Input type="text" value={editUtilityTitle} onChange={(e) => setEditUtilityTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (BDT ৳)</label>
            <Input type="number" step="0.01" value={editUtilityAmount} onChange={(e) => setEditUtilityAmount(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <Select value={editUtilityCategory} onChange={(e) => setEditUtilityCategory(e.target.value as CostCategory)}>
              <option value="UTILITY">Utility (Electricity, Gas, Water, Wifi)</option>
              <option value="REPAIR">Repair & Maintenance</option>
              <option value="OTHER">Other / Miscellaneous</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Paid By</label>
            <Select value={editUtilityPayer} onChange={(e) => setEditUtilityPayer(e.target.value)}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setEditingUtility(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteBazarId}
        title="Delete bazar entry?"
        message="This grocery expense will be permanently removed and the meal rate recalculated."
        onCancel={() => setDeleteBazarId(null)}
        onConfirm={async () => {
          if (deleteBazarId) await deleteBazarCost(deleteBazarId);
          setDeleteBazarId(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteUtilityId}
        title="Delete utility entry?"
        message="This shared bill will be permanently removed."
        onCancel={() => setDeleteUtilityId(null)}
        onConfirm={async () => {
          if (deleteUtilityId) await deleteUtilityCost(deleteUtilityId);
          setDeleteUtilityId(null);
        }}
      />
    </div>
  );
};
