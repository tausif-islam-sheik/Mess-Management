"use client";

import React, { useState } from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { Role } from "@/lib/types";
import { Shield, User, Globe, Sparkles, Wallet, LogOut, LogIn, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Navbar: React.FC = () => {
  const { currentUser, setCurrentUserRole, setCurrentUserId, users, mess, memberSummaries, isAuthenticated, logout, updateMessName } = useMess();
  const { lang, setLang, t } = useLanguage();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const mySummary = memberSummaries.find((m) => m.user.id === currentUser.id);

  const openEditor = () => {
    setDraftName(mess.name);
    setSaveError("");
    setIsEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim() || saving) return;
    setSaving(true);
    setSaveError("");
    try {
      await updateMessName(draftName);
      setIsEditOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save mess name. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl px-6 py-3 sm:px-8">
      <div className="flex w-full items-center justify-between gap-6">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-lg shadow-emerald-900/30 text-white font-bold text-lg">
            🍽️
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              {mess.name}
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <Sparkles className="h-3 w-3" /> Live
              </span>
              {isAuthenticated && (
                <button
                  onClick={openEditor}
                  className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition-colors"
                  title="Edit mess name"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">{t.appSubtitle}</p>
          </div>
        </div>

        {/* Right Actions & Switches */}
        <div className="flex items-center gap-3 sm:gap-5 mr-6">
          {/* User Net Balance Badge */}
          {isAuthenticated && mySummary && (
            <div className="hidden md:flex items-center gap-2.5 rounded-lg bg-slate-900 border border-slate-800 px-4 py-2 text-xs">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-400">{t.dashboard.myBalance}</div>
                <div className={`font-bold ${mySummary.netBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {mySummary.netBalance >= 0 ? `+${formatCurrency(mySummary.netBalance)}` : formatCurrency(mySummary.netBalance)}
                </div>
              </div>
            </div>
          )}

          {/* User Selector Dropdown */}
          {isAuthenticated && (
            <div className="relative flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 rounded-lg px-3.5 py-2 text-xs">
              <User className="h-4 w-4 text-slate-400" />
              <select
                value={currentUser.id}
                onChange={(e) => setCurrentUserId(e.target.value)}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer py-1"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Role Switcher */}
          {isAuthenticated && (
            <div className="relative hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs">
              <Shield className="h-4 w-4 text-emerald-400" />
              <select
                value={currentUser.role}
                onChange={(e) => setCurrentUserRole(e.target.value as Role)}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer py-1"
              >
                <option value="MANAGER" className="bg-slate-900">{t.roles.MANAGER}</option>
                <option value="BAZAR_MANAGER" className="bg-slate-900">{t.roles.BAZAR_MANAGER}</option>
                <option value="MEMBER" className="bg-slate-900">{t.roles.MEMBER}</option>
                <option value="SUPER_ADMIN" className="bg-slate-900">{t.roles.SUPER_ADMIN}</option>
              </select>
            </div>
          )}

          {/* Language Toggle Button */}
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors"
            title="Toggle Bangla / English"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-400" />
            {lang === "en" ? "বাংলা" : "English"}
          </button>

          {/* Logout / Login Button */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 border-rose-500/20 transition-colors"
              title="Log Out of Session"
            >
              <LogOut className="h-3.5 w-3.5" /> Log Out
            </button>
          ) : null}
        </div>
      </div>

      {/* Edit Mess Name Dialog */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Mess Name"
        description="This name appears in the navbar, dashboard and shared reports."
      >
        <form onSubmit={handleSave} className="space-y-4">
          {saveError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {saveError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mess Name
            </label>
            <Input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="e.g. Shanti Nibash Hostel Mess"
              maxLength={80}
              required
              autoFocus
            />
          </div>
          <div className="flex items-center justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald" disabled={saving || !draftName.trim()}>
              {saving ? "Saving…" : "Save Name"}
            </Button>
          </div>
        </form>
      </Dialog>
    </header>
  );
};
