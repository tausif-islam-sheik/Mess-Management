"use client";

import React, { useState } from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { useDashboardSettings } from "@/lib/dashboard-settings";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Settings as SettingsIcon,
  Building2,
  ImagePlus,
  LayoutDashboard,
  Languages,
  UserCircle2,
  Database,
  LogOut,
  Check,
  AlertTriangle,
} from "lucide-react";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Toggle: React.FC<{ enabled: boolean; onToggle: () => void; label: string; hint: string }> = ({
  enabled,
  onToggle,
  label,
  hint,
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-colors text-left"
  >
    <div>
      <div className="text-xs font-bold text-white">{label}</div>
      <div className="text-[11px] text-slate-400">{hint}</div>
    </div>
    <span
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        enabled ? "bg-emerald-600" : "bg-slate-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </span>
  </button>
);

export const SettingsView: React.FC = () => {
  const {
    mess,
    currentUser,
    updateMessName,
    updateMessCurrency,
    updateMessLogo,
    logout,
    resetToDemoData,
  } = useMess();
  const { t, lang, setLang } = useLanguage();
  const { settings, update } = useDashboardSettings();

  const [messName, setMessName] = useState(mess.name);
  const [currency, setCurrency] = useState(mess.currency);
  const [logoPreview, setLogoPreview] = useState(mess.logoUrl ?? "");
  const [saved, setSaved] = useState("");
  const [saveError, setSaveError] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleMessSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved("");
    setSaveError("");
    try {
      if (messName.trim() && messName.trim() !== mess.name) {
        await updateMessName(messName.trim());
      }
      if (currency.trim() && currency.trim() !== mess.currency) {
        await updateMessCurrency(currency.trim());
      }
      setSaved("Mess settings saved.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save settings.");
    }
  };

  const handleLogoFile = (file: File | undefined) => {
    setSaveError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSaveError("Please choose an image file (PNG, JPG, SVG).");
      return;
    }
    if (file.size > 1_500_000) {
      setSaveError("Logo must be smaller than 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoSave = async () => {
    setSaved("");
    setSaveError("");
    try {
      await updateMessLogo(logoPreview);
      setSaved("Mess logo updated.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update logo.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-emerald-400" />
          {t.nav.settings}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Control mess profile, dashboard sections, language and data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mess Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-400" /> Mess Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMessSave} className="space-y-4">
              {saved && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4" /> {saved}
                </div>
              )}
              {saveError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  {saveError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mess Name</label>
                <Input type="text" value={messName} onChange={(e) => setMessName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Currency</label>
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="BDT">BDT (৳ Taka)</option>
                  <option value="USD">USD ($ Dollar)</option>
                  <option value="INR">INR (₹ Rupee)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="emerald">
                  Save Mess Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Mess Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <ImagePlus className="h-4 w-4 text-emerald-400" /> Mess Logo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 overflow-hidden text-2xl">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Mess logo preview" className="h-full w-full object-cover" />
                  ) : (
                    <img src="/logo.svg" alt="Default logo" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  Shown left of the mess name in the navbar.
                  <br />
                  PNG/JPG/SVG, max 1.5 MB.
                </div>
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoFile(e.target.files?.[0])}
              />
              <div className="flex justify-end gap-2.5">
                {logoPreview && (
                  <Button type="button" variant="outline" onClick={() => setLogoPreview("")}>
                    Remove
                  </Button>
                )}
                <Button type="button" variant="emerald" onClick={handleLogoSave}>
                  Save Logo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Control */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-cyan-400" /> Dashboard Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              <Toggle
                enabled={settings.showStats}
                onToggle={() => update({ showStats: !settings.showStats })}
                label="Stats Cards"
                hint="Total meals, bazar, meal rate & utility tiles"
              />
              <Toggle
                enabled={settings.showChart}
                onToggle={() => update({ showChart: !settings.showChart })}
                label="Expense Chart"
                hint="Monthly expense breakdown graph"
              />
              <Toggle
                enabled={settings.showMembers}
                onToggle={() => update({ showMembers: !settings.showMembers })}
                label="Member Table"
                hint="Meals & net balance summary"
              />
              <p className="text-[11px] text-slate-500 pt-1">
                Changes apply instantly to the dashboard and are saved on this device.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Languages className="h-4 w-4 text-amber-400" /> Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`p-3 rounded-xl border text-xs font-bold transition-colors ${
                  lang === "en"
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                    : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("bn")}
                className={`p-3 rounded-xl border text-xs font-bold transition-colors ${
                  lang === "bn"
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                    : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                }`}
              >
                বাংলা
              </button>
            </div>
          </CardContent>
        </Card>

        {/* My Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <UserCircle2 className="h-4 w-4 text-purple-400" /> My Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/60">
              <Avatar className="h-11 w-11 border border-slate-700">
                <AvatarImage
                  src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                  alt={currentUser.name}
                />
                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400 truncate">
                  {currentUser.email ?? currentUser.phone}
                </div>
              </div>
              <Badge variant="emerald">{currentUser.role.replace("_", " ")}</Badge>
            </div>
            <div className="flex justify-end mt-4">
              <Button type="button" variant="outline" onClick={logout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Log Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-rose-500/30">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-rose-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-500" />
              Reset all local data back to the initial demo state.
            </div>
            <Button type="button" variant="destructive" onClick={() => setShowResetConfirm(true)}>
              Reset Demo Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showResetConfirm}
        title="Reset all data?"
        message="Local state will be cleared and restored to demo defaults. Server data is not affected."
        confirmLabel="Reset"
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={() => {
          resetToDemoData();
          setShowResetConfirm(false);
        }}
      />
    </div>
  );
};
