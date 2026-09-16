"use client";

import { useState, useEffect, useCallback } from "react";

export interface DashboardSettings {
  showStats: boolean;
  showChart: boolean;
  showMembers: boolean;
}

const STORAGE_KEY = "mess_dashboard_settings";

const DEFAULTS: DashboardSettings = {
  showStats: true,
  showChart: true,
  showMembers: true,
};

export function useDashboardSettings() {
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULTS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSettings({ ...DEFAULTS, ...JSON.parse(saved) });
    } catch {
      /* keep defaults */
    }
  }, []);

  const update = useCallback((patch: Partial<DashboardSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { settings, update };
}
