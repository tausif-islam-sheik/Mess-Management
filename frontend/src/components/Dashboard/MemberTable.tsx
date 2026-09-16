"use client";

import React, { useState } from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RowActions } from "@/components/ui/row-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { User } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Users, Phone, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const MemberTable: React.FC = () => {
  const { memberSummaries, currentUser, updateMember, deleteMember } = useMess();
  const { t } = useLanguage();

  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<User["role"]>("MEMBER");
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const openEditMember = (u: User) => {
    setEditingMember(u);
    setEditName(u.name);
    setEditPhone(u.phone);
    setEditEmail(u.email ?? "");
    setEditRole(u.role);
    setFormError("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setFormError("");
    try {
      await updateMember(editingMember.id, {
        name: editName,
        phone: editPhone,
        email: editEmail,
        role: editRole,
      });
      setEditingMember(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update member.");
    }
  };

  return (
    <Card className="mb-6 py-2 gap-3">
      <CardHeader>
        <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-400" />
          {t.dashboard.memberSummaryTitle}
        </CardTitle>
        <CardAction>
          <span className="text-xs text-slate-400 font-normal">
            {memberSummaries.length} Members Enrolled
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-800 uppercase tracking-wider hover:bg-transparent">
              <TableHead className="text-slate-400 font-semibold text-xs">Member</TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs">Role</TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs text-center">Meals (L/D/G)</TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs text-right">Total Meals</TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs text-right">Bazar Cost</TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs text-right">Utility Share</TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs text-right">Total Cost</TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs text-right">Deposits Paid</TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs text-right">Net Balance</TableHead>
              <TableHead className="text-slate-400 font-semibold text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-800/60 font-medium">
            {memberSummaries.map((m) => {
              const isSurplus = m.netBalance >= 0;
              return (
                <TableRow key={m.user.id} className="hover:bg-slate-800/40 transition-colors border-slate-800/60">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 border border-slate-700">
                        <AvatarImage
                          src={m.user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                          alt={m.user.name}
                        />
                        <AvatarFallback>{getInitials(m.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-white text-xs sm:text-sm">{m.user.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5" /> {m.user.phone}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        m.user.role === "MANAGER"
                          ? "amber"
                          : m.user.role === "BAZAR_MANAGER"
                          ? "indigo"
                          : "default"
                      }
                    >
                      {m.user.role.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center text-slate-300 text-xs">
                    <span className="text-emerald-400 font-bold">{m.lunchMeals}L</span> /{" "}
                    <span className="text-amber-400 font-bold">{m.dinnerMeals}D</span> /{" "}
                    <span className="text-purple-400 font-bold">{m.guestMeals}G</span>
                  </TableCell>

                  <TableCell className="text-right font-bold text-white text-sm">
                    {m.totalMeals}
                  </TableCell>

                  <TableCell className="text-right text-emerald-400 text-xs">
                    {formatCurrency(m.bazarCostShare)}
                  </TableCell>

                  <TableCell className="text-right text-purple-400 text-xs">
                    {formatCurrency(m.utilityShare)}
                  </TableCell>

                  <TableCell className="text-right font-bold text-slate-200 text-xs">
                    {formatCurrency(m.totalCost)}
                  </TableCell>

                  <TableCell className="text-right text-cyan-400 text-xs">
                    {formatCurrency(m.totalDeposited)}
                  </TableCell>

                  <TableCell className="text-right font-bold">
                    <div className="flex items-center justify-end gap-1">
                      {isSurplus ? (
                        <>
                          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-xs">+{formatCurrency(m.netBalance)}</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownLeft className="h-3.5 w-3.5 text-rose-400" />
                          <span className="text-rose-400 text-xs">{formatCurrency(m.netBalance)}</span>
                        </>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {isSurplus ? t.dashboard.surplus : t.dashboard.due}
                    </div>
                  </TableCell>
                  <TableCell>
                    <RowActions
                      onEdit={() => openEditMember(m.user)}
                      onDelete={() => setDeleteMemberId(m.user.id)}
                      canDelete={m.user.id !== currentUser.id}
                      deleteTitle={m.user.id === currentUser.id ? "You cannot delete your own account" : "Delete member"}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit Member Modal */}
      <Dialog
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        title="Edit Member"
        description="Update member profile and role."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Name</label>
            <Input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
            <Input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
            <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
            <Select value={editRole} onChange={(e) => setEditRole(e.target.value as User["role"])}>
              <option value="MEMBER">Member</option>
              <option value="MANAGER">Manager</option>
              <option value="BAZAR_MANAGER">Bazar Manager</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setEditingMember(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteMemberId}
        title="Delete member?"
        message="This member will be permanently removed from the mess."
        onCancel={() => setDeleteMemberId(null)}
        onConfirm={async () => {
          if (deleteMemberId) await deleteMember(deleteMemberId);
          setDeleteMemberId(null);
        }}
      />
    </Card>
  );
};
