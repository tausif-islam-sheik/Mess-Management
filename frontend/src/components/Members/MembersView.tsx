"use client";

import React, { useMemo, useState } from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatsCards } from "@/components/Dashboard/StatsCards";
import { RowActions } from "@/components/ui/row-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { User, Role, MemberSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  Plus,
  UserPlus,
  Utensils,
  Wallet,
  Phone,
  Mail,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUpDown,
  Trash2,
} from "lucide-react";

type MemberRow = {
  user: User;
  summary?: MemberSummary;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const roleBadgeVariant = (role: Role) =>
  role === "MANAGER" ? "amber" : role === "BAZAR_MANAGER" ? "indigo" : "default";

export const MembersView: React.FC = () => {
  const { users, memberSummaries, currentUser, addMember, updateMember, deleteMember } = useMess();
  const { t } = useLanguage();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<MemberRow[]>([]);
  const [formError, setFormError] = useState("");

  // Add form
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState<Role>("MEMBER");

  // Edit form
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<Role>("MEMBER");

  const managerCount = users.filter((u) => u.role !== "MEMBER").length;
  const totalMeals = memberSummaries.reduce((sum, m) => sum + m.totalMeals, 0);
  const pendingDues = memberSummaries
    .filter((m) => m.netBalance < 0)
    .reduce((sum, m) => sum + Math.abs(m.netBalance), 0);

  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const tableData: MemberRow[] = useMemo(
    () =>
      users
        .map((u) => ({
          user: u,
          summary: memberSummaries.find((m) => m.user.id === u.id),
        }))
        .filter((row) => roleFilter === "ALL" || row.user.role === roleFilter),
    [users, memberSummaries, roleFilter]
  );

  const columns: ColumnDef<MemberRow, any>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => {
          const pageRows = table
            .getRowModel()
            .rows.filter((r) => (r.original as MemberRow).user.id !== currentUser.id);
          const allSelected = pageRows.length > 0 && pageRows.every((r) => r.getIsSelected());
          return (
            <input
              type="checkbox"
              aria-label="Select all"
              checked={allSelected}
              onChange={(e) => pageRows.forEach((r) => r.toggleSelected(e.target.checked))}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-emerald-500 cursor-pointer"
            />
          );
        },
        cell: ({ row }) => {
          const isSelf = row.original.user.id === currentUser.id;
          return (
            <input
              type="checkbox"
              aria-label="Select row"
              checked={row.getIsSelected()}
              disabled={isSelf}
              title={isSelf ? "You cannot delete your own account" : "Select row"}
              onChange={(e) => row.toggleSelected(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-emerald-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            />
          );
        },
        enableSorting: false,
      },
      {
        id: "member",
        accessorFn: (row) => `${row.user.name} ${row.user.phone}`,
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1 hover:text-slate-200"
          >
            Member <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const u = row.original.user;
          return (
            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8 border border-slate-700">
                <AvatarImage
                  src={u.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                  alt={u.name}
                />
                <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
              </Avatar>
              <div className="font-bold text-white text-xs sm:text-sm whitespace-nowrap">
                {u.name}
                {u.id === currentUser.id && (
                  <span className="ml-1.5 text-[10px] text-emerald-400 font-semibold">(You)</span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => {
          const u = row.original.user;
          return (
            <div className="text-slate-300 whitespace-nowrap">
              <div className="flex items-center gap-1 text-[11px]">
                <Phone className="h-3 w-3 text-slate-500" /> {u.phone}
              </div>
              {u.email && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                  <Mail className="h-3 w-3 text-slate-500" /> {u.email}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "role",
        accessorFn: (row) => row.user.role,
        header: "Role",
        cell: ({ row }) => {
          const role = row.original.user.role;
          return <Badge variant={roleBadgeVariant(role)}>{role.replace("_", " ")}</Badge>;
        },
      },
      {
        id: "meals",
        header: () => <div className="text-center">Meals (L/D/G)</div>,
        cell: ({ row }) => {
          const summary = row.original.summary;
          if (!summary) return <span className="text-slate-600">—</span>;
          return (
            <div className="text-center text-slate-300 text-xs whitespace-nowrap">
              <span className="text-emerald-400 font-bold">{summary.lunchMeals}L</span> /{" "}
              <span className="text-amber-400 font-bold">{summary.dinnerMeals}D</span> /{" "}
              <span className="text-purple-400 font-bold">{summary.guestMeals}G</span>
            </div>
          );
        },
      },
      {
        id: "totalMeals",
        accessorFn: (row) => row.summary?.totalMeals ?? -1,
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1 hover:text-slate-200 ml-auto"
          >
            <span className="ml-auto">Total Meals</span> <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const summary = row.original.summary;
          return (
            <div className="text-right font-bold text-white text-sm">
              {summary ? summary.totalMeals : "—"}
            </div>
          );
        },
      },
      {
        id: "totalCost",
        accessorFn: (row) => row.summary?.totalCost ?? -1,
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1 hover:text-slate-200 ml-auto"
          >
            <span className="ml-auto">Total Cost</span> <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const summary = row.original.summary;
          return (
            <div className="text-right font-bold text-slate-200 text-xs whitespace-nowrap">
              {summary ? formatCurrency(summary.totalCost) : "—"}
            </div>
          );
        },
      },
      {
        id: "deposited",
        accessorFn: (row) => row.summary?.totalDeposited ?? -1,
        header: () => <div className="text-right">Deposited</div>,
        cell: ({ row }) => {
          const summary = row.original.summary;
          return (
            <div className="text-right text-cyan-400 text-xs whitespace-nowrap">
              {summary ? formatCurrency(summary.totalDeposited) : "—"}
            </div>
          );
        },
      },
      {
        id: "netBalance",
        accessorFn: (row) => row.summary?.netBalance ?? -999999,
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1 hover:text-slate-200 ml-auto"
          >
            <span className="ml-auto">Net Balance</span> <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const summary = row.original.summary;
          if (!summary) return <span className="text-slate-600">—</span>;
          const isSurplus = summary.netBalance >= 0;
          return (
            <div className="flex items-center justify-end gap-1 whitespace-nowrap">
              {isSurplus ? (
                <>
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-bold">
                    +{formatCurrency(summary.netBalance)}
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownLeft className="h-3.5 w-3.5 text-rose-400" />
                  <span className="text-rose-400 text-xs font-bold">
                    {formatCurrency(summary.netBalance)}
                  </span>
                </>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const u = row.original.user;
          return (
            <div className="flex justify-end">
              <RowActions
                onEdit={() => {
                  setEditingMember(u);
                  setEditName(u.name);
                  setEditPhone(u.phone);
                  setEditEmail(u.email ?? "");
                  setEditRole(u.role);
                  setFormError("");
                }}
                onDelete={() => setDeleteMemberId(u.id)}
                canDelete={u.id !== currentUser.id}
                deleteTitle={u.id === currentUser.id ? "You cannot delete your own account" : "Delete member"}
              />
            </div>
          );
        },
      },
    ],
    [currentUser.id]
  );

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      await addMember(addName, addPhone, addEmail, addPassword || "Member@123", addRole);
      setIsAddOpen(false);
      setAddName("");
      setAddPhone("");
      setAddEmail("");
      setAddPassword("");
      setAddRole("MEMBER");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add member.");
    }
  };

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

  const deletableSelected = selectedRows.filter((r) => r.user.id !== currentUser.id);

  const handleBulkDelete = async () => {
    if (deletableSelected.length === 0 || isBulkDeleting) return;
    setIsBulkDeleting(true);
    try {
      for (const row of deletableSelected) {
        await deleteMember(row.user.id);
      }
      setSelectedRows([]);
      setIsBulkDeleteOpen(false);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-400" />
            {t.nav.members}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            All member profiles, meal counts, balances and contact details.
          </p>
        </div>

        <Button variant="emerald" onClick={() => { setFormError(""); setIsAddOpen(true); }} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Member
        </Button>
      </div>

      {/* Stats */}
      <StatsCards
        items={[
          {
            title: "Total Members",
            value: String(users.length),
            subtext: "Enrolled",
            icon: Users,
            color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
          },
          {
            title: "Managers",
            value: String(managerCount),
            subtext: "Admin roles",
            icon: UserPlus,
            color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400",
          },
          {
            title: "Total Meals",
            value: String(totalMeals),
            subtext: "This period",
            icon: Utensils,
            color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
          },
          {
            title: "Pending Dues",
            value: formatCurrency(pendingDues),
            subtext: "To be collected",
            icon: Wallet,
            color: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400",
          },
        ]}
      />

      {/* Members Data Table (shadcn) */}
      <Card className="mb-6 py-2 gap-3">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            All Members ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={tableData}
            searchKey="member"
            searchPlaceholder="Search by name or phone..."
            getRowId={(row) => row.user.id}
            onSelectionChange={setSelectedRows}
            toolbarExtra={
              <>
                {deletableSelected.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBulkDeleteOpen(true)}
                    className="flex items-center gap-1.5 border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete ({deletableSelected.length})
                  </Button>
                )}
                <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="ALL">All Roles</option>
                  <option value="MEMBER">Member</option>
                  <option value="MANAGER">Manager</option>
                  <option value="BAZAR_MANAGER">Bazar Manager</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </Select>
              </>
            }
          />
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Member"
        description="Enroll a new member with login credentials."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <Input type="text" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. Karim Uddin" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
            <Input type="text" value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="+8801XXXXXXXXX" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
            <Input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="member@example.com" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password (min 6 chars)</label>
            <Input type="password" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} placeholder="Defaults to Member@123" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
            <Select value={addRole} onChange={(e) => setAddRole(e.target.value as Role)}>
              <option value="MEMBER">Member</option>
              <option value="MANAGER">Manager</option>
              <option value="BAZAR_MANAGER">Bazar Manager</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Add Member
            </Button>
          </div>
        </form>
      </Dialog>

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
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
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
            <Select value={editRole} onChange={(e) => setEditRole(e.target.value as Role)}>
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

      <ConfirmDialog
        open={isBulkDeleteOpen}
        title={`Delete ${deletableSelected.length} member(s)?`}
        message="Selected members will be permanently removed from the mess. Your own account is excluded."
        onCancel={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
};
