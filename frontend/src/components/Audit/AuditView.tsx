"use client";

import React from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { History, ShieldCheck, User, Clock } from "lucide-react";
import { formatTime, formatDate } from "@/lib/utils";

export const AuditView: React.FC = () => {
  const { auditLogs } = useMess();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
          <History className="h-6 w-6 text-emerald-400" />
          {t.audit.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">{t.audit.subtitle}</p>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-slate-200">
            System Event Trail ({auditLogs.length} Events)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Actor</th>
                  <th className="py-3 px-3">Action Type</th>
                  <th className="py-3 px-3">Details / Audit Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {formatDate(log.createdAt)} {formatTime(log.createdAt)}
                    </td>
                    <td className="py-3 px-3 text-white font-bold">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3 text-emerald-400" />
                        {log.actorName}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] font-mono text-cyan-300 font-bold border border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
