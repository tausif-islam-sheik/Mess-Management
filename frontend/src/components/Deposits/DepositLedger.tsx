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
import { Wallet, Plus, CreditCard, CheckCircle2, ArrowUpRight, ArrowDownLeft, ShieldCheck, PiggyBank, ReceiptText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatsCards } from "@/components/Dashboard/StatsCards";
import { RowActions } from "@/components/ui/row-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Deposit } from "@/lib/types";

export const DepositLedger: React.FC = () => {
  const { deposits, addDeposit, updateDeposit, deleteDeposit, memberSummaries, users, currentUser } = useMess();
  const { t } = useLanguage();

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(currentUser.id);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"bKash" | "Nagad" | "Rocket" | "Cash" | "Bank">("bKash");
  const [note, setNote] = useState("");

  // Edit / Delete state
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [editUser, setEditUser] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editMethod, setEditMethod] = useState<"bKash" | "Nagad" | "Rocket" | "Cash" | "Bank">("bKash");
  const [editNote, setEditNote] = useState("");
  const [deleteDepositId, setDeleteDepositId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const totalDeposited = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalDue = memberSummaries.filter((m) => m.netBalance < 0).reduce((sum, m) => sum + Math.abs(m.netBalance), 0);
  const totalSurplus = memberSummaries.filter((m) => m.netBalance >= 0).reduce((sum, m) => sum + m.netBalance, 0);

  const openEditDeposit = (dep: Deposit) => {
    setEditingDeposit(dep);
    setEditUser(dep.userId);
    setEditAmount(String(dep.amount));
    setEditMethod(dep.method);
    setEditNote(dep.note ?? "");
    setFormError("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeposit) return;
    const amountNum = parseFloat(editAmount);
    if (!amountNum || amountNum <= 0) return;
    setFormError("");
    try {
      await updateDeposit(editingDeposit.id, {
        userId: editUser,
        amount: amountNum,
        method: editMethod,
        note: editNote,
      });
      setEditingDeposit(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update deposit.");
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) return;

    addDeposit(selectedUser, amountNum, method, note);
    setIsDepositModalOpen(false);
    setAmount("");
    setNote("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-400" />
            {t.deposits.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Track member advance deposits, bKash/Nagad transactions, and net surplus/due ledger.
          </p>
        </div>

        <Button variant="emerald" onClick={() => setIsDepositModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t.deposits.addDeposit}
        </Button>
      </div>

      {/* Stats */}
      <StatsCards
        items={[
          {
            title: "Total Deposited",
            value: formatCurrency(totalDeposited),
            subtext: `${deposits.length} transactions`,
            icon: Wallet,
            color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
          },
          {
            title: "Pending Dues",
            value: formatCurrency(totalDue),
            subtext: "To be collected",
            icon: ArrowDownLeft,
            color: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400",
          },
          {
            title: "Total Surplus",
            value: formatCurrency(totalSurplus),
            subtext: "Advance balance",
            icon: PiggyBank,
            color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
          },
          {
            title: "Members",
            value: String(memberSummaries.length),
            subtext: "Enrolled",
            icon: ReceiptText,
            color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
          },
        ]}
      />

      {/* Member Balances Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {memberSummaries.map((m) => {
          const isSurplus = m.netBalance >= 0;
          return (
            <Card key={m.user.id} className="bg-slate-900/90 border-slate-800">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={m.user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                    alt={m.user.name}
                    className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white">{m.user.name}</h3>
                    <p className="text-[10px] text-slate-400">Total Deposited: {formatCurrency(m.totalDeposited)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xs font-bold flex items-center justify-end gap-1 ${isSurplus ? "text-emerald-400" : "text-rose-400"}`}>
                    {isSurplus ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                    {isSurplus ? `+${formatCurrency(m.netBalance)}` : formatCurrency(m.netBalance)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">
                    {isSurplus ? "Surplus" : "Pending Due"}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Deposit Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-slate-200">
            <CreditCard className="h-4 w-4 text-cyan-400" />
            Deposit Transaction History ({deposits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Member</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Ref ID / Note</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {deposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-mono">{formatDate(dep.date)}</td>
                    <td className="py-3 px-3 text-white font-semibold">{dep.userName || "Member"}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          dep.method === "bKash"
                            ? "rose"
                            : dep.method === "Nagad"
                            ? "amber"
                            : "emerald"
                        }
                      >
                        {dep.method}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{dep.note || "N/A"}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400 text-sm">
                      +{formatCurrency(dep.amount)}
                    </td>
                    <td className="py-3 px-3">
                      <RowActions onEdit={() => openEditDeposit(dep)} onDelete={() => setDeleteDepositId(dep.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Deposit Modal */}
      <Dialog
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title={t.deposits.addDeposit}
        description="Log advance cash or Mobile Financial Service (bKash/Nagad/Rocket) payment."
      >
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Member</label>
            <Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.phone})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Deposit Amount (BDT ৳)</label>
            <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 2500" required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.deposits.paymentMethod}</label>
            <Select value={method} onChange={(e) => setMethod(e.target.value as any)}>
              <option value="bKash">bKash (MFS)</option>
              <option value="Nagad">Nagad (MFS)</option>
              <option value="Rocket">Rocket (MFS)</option>
              <option value="Cash">Hand Cash</option>
              <option value="Bank">Bank Transfer</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.deposits.note}</label>
            <Input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. TrxID: 9A8B7C6D or Advance for Sept" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsDepositModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Record Deposit
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Deposit Modal */}
      <Dialog
        isOpen={!!editingDeposit}
        onClose={() => setEditingDeposit(null)}
        title="Edit Deposit"
        description="Update this deposit transaction."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Member</label>
            <Select value={editUser} onChange={(e) => setEditUser(e.target.value)}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.phone})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Deposit Amount (BDT ৳)</label>
            <Input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.deposits.paymentMethod}</label>
            <Select value={editMethod} onChange={(e) => setEditMethod(e.target.value as any)}>
              <option value="bKash">bKash (MFS)</option>
              <option value="Nagad">Nagad (MFS)</option>
              <option value="Rocket">Rocket (MFS)</option>
              <option value="Cash">Hand Cash</option>
              <option value="Bank">Bank Transfer</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.deposits.note}</label>
            <Input type="text" value={editNote} onChange={(e) => setEditNote(e.target.value)} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setEditingDeposit(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteDepositId}
        title="Delete deposit?"
        message="This deposit transaction will be permanently removed and balances recalculated."
        onCancel={() => setDeleteDepositId(null)}
        onConfirm={async () => {
          if (deleteDepositId) await deleteDeposit(deleteDepositId);
          setDeleteDepositId(null);
        }}
      />
    </div>
  );
};
