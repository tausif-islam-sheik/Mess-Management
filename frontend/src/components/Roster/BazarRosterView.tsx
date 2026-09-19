"use client";

import React, { useState } from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Plus, UserCheck, ShieldAlert, CheckCircle2, Clock, ListOrdered } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StatsCards } from "@/components/Dashboard/StatsCards";
import { RowActions } from "@/components/ui/row-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { BazarRoster } from "@/lib/types";

export const BazarRosterView: React.FC = () => {
  const { roster, assignBazarRoster, updateRosterEntry, deleteRosterEntry, users } = useMess();
  const { t } = useLanguage();

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(users[0]?.id || "");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // Edit / Delete state
  const [editingEntry, setEditingEntry] = useState<BazarRoster | null>(null);
  const [editUser, setEditUser] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editStatus, setEditStatus] = useState<BazarRoster["status"]>("PENDING");
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const activeCount = roster.filter((r) => r.status === "ACTIVE").length;
  const pendingCount = roster.filter((r) => r.status === "PENDING").length;
  const completedCount = roster.filter((r) => r.status === "COMPLETED").length;

  const openEditEntry = (r: BazarRoster) => {
    setEditingEntry(r);
    setEditUser(r.userId);
    setEditStart(r.startDate);
    setEditEnd(r.endDate);
    setEditStatus(r.status);
    setFormError("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;
    setFormError("");
    try {
      await updateRosterEntry(editingEntry.id, {
        userId: editUser,
        startDate: editStart,
        endDate: editEnd,
        status: editStatus,
      });
      setEditingEntry(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update duty.");
    }
  };

  const activeManager = roster.find((r) => r.status === "ACTIVE") || roster[0];

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignBazarRoster(selectedUser, startDate, endDate);
    setIsAssignOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-emerald-400" />
            {t.roster.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">{t.roster.subtitle}</p>
        </div>

        <Button variant="emerald" onClick={() => setIsAssignOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t.roster.assignDuty}
        </Button>
      </div>

      {/* Stats */}
      <StatsCards
        items={[
          {
            title: "Total Duties",
            value: String(roster.length),
            subtext: "Assigned rotations",
            icon: ListOrdered,
            color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
          },
          {
            title: "Active",
            value: String(activeCount),
            subtext: "On duty now",
            icon: UserCheck,
            color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
          },
          {
            title: "Pending",
            value: String(pendingCount),
            subtext: "Upcoming",
            icon: Clock,
            color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
          },
          {
            title: "Completed",
            value: String(completedCount),
            subtext: "Finished duties",
            icon: CheckCircle2,
            color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400",
          },
        ]}
      />

      {/* Active Duty Card */}
      {activeManager && (
        <Card className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <UserCheck className="h-7 w-7" />
              </div>
              <div>
                <Badge variant="emerald" className="mb-1">
                  Active Duty Manager
                </Badge>
                <h3 className="text-lg font-bold text-white">{activeManager.userName || "Member"}</h3>
                <p className="text-xs text-slate-400">
                  Duty Period: <span className="text-emerald-300 font-semibold">{formatDate(activeManager.startDate)}</span> to{" "}
                  <span className="text-emerald-300 font-semibold">{formatDate(activeManager.endDate)}</span>
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 max-w-xs text-center sm:text-right bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              Responsible for daily market shopping, keeping receipts, and logging expenses.
            </div>
          </div>
        </Card>
      )}

      {/* Roster Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-slate-200">
            Upcoming Duty Rotation Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Assigned Member</th>
                  <th className="py-3 px-3">Start Date</th>
                  <th className="py-3 px-3">End Date</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {roster.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-white font-bold text-sm">{r.userName || "Member"}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{formatDate(r.startDate)}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{formatDate(r.endDate)}</td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant={r.status === "ACTIVE" ? "emerald" : "default"}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <RowActions onEdit={() => openEditEntry(r)} onDelete={() => setDeleteEntryId(r.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Duty Modal */}
      <Dialog
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title={t.roster.assignDuty}
        description="Assign grocery market shopping duty to a member for the upcoming week."
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Member</label>
            <Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Duty Start Date</label>
            <DatePicker value={startDate} onChange={setStartDate} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Duty End Date</label>
            <DatePicker value={endDate} onChange={setEndDate} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Assign Bazar Duty
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Duty Modal */}
      <Dialog
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        title="Edit Bazar Duty"
        description="Reassign or reschedule this duty entry."
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
                  {u.name} ({u.role})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Duty Start Date</label>
            <DatePicker value={editStart} onChange={setEditStart} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Duty End Date</label>
            <DatePicker value={editEnd} onChange={setEditEnd} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
            <Select value={editStatus} onChange={(e) => setEditStatus(e.target.value as BazarRoster["status"])}>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteEntryId}
        title="Delete duty entry?"
        message="This bazar duty assignment will be permanently removed."
        onCancel={() => setDeleteEntryId(null)}
        onConfirm={async () => {
          if (deleteEntryId) await deleteRosterEntry(deleteEntryId);
          setDeleteEntryId(null);
        }}
      />
    </div>
  );
};
