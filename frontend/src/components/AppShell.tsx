"use client";

import React from "react";
import { useMess } from "@/context/MessContext";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { LoginView } from "@/components/Auth/LoginView";
import { Skeleton } from "@/components/ui/skeleton";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useMess();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8 space-y-4">
        <Skeleton className="h-12 w-full bg-slate-900" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 bg-slate-900" />
          <Skeleton className="h-32 bg-slate-900" />
          <Skeleton className="h-32 bg-slate-900" />
          <Skeleton className="h-32 bg-slate-900" />
        </div>
        <Skeleton className="h-64 w-full bg-slate-900" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Fixed Top Navbar */}
      <Navbar />

      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content — offset by navbar height + sidebar width (256px = w-64) */}
      <main className="lg:ml-64 min-h-screen pl-4 pr-5 sm:pl-6 sm:pr-8 lg:pl-10 lg:pr-12 pb-24 lg:pb-10 pt-[89px] sm:pt-[97px] lg:pt-[105px]">
        {children}
      </main>
    </div>
  );
}
