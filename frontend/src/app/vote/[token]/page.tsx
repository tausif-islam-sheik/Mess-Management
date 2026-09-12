"use client";

import React, { useState, use, useEffect } from "react";
import { MessProvider, useMess } from "@/context/MessContext";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Vote as VoteIcon, CheckCircle2, Utensils, Users, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface PublicMember {
  id: string;
  name: string;
  phone: string;
}

interface PublicPoll {
  id: string;
  date: string;
  mealType: string;
  cutoffTime: string;
  isOpen: boolean;
  token: string;
  members: PublicMember[];
}

function DirectVoteContent({ token }: { token: string }) {
  const { polls, castVote, users } = useMess();
  const { t } = useLanguage();

  const [apiPoll, setApiPoll] = useState<PublicPoll | null>(null);
  const [apiAttempted, setApiAttempted] = useState(false);

  // Prefer the live API poll (works logged-out via the public share link).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const poll = await apiFetch<PublicPoll>(`/polls/token/${token}`, {
          auth: false,
          timeoutMs: 6000,
        });
        if (!cancelled) setApiPoll(poll);
      } catch {
        /* API unreachable — fall back to local context data below */
      } finally {
        if (!cancelled) setApiAttempted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const fallbackPoll = polls.find((p) => p.token === token) || polls[0];
  const usingApi = apiPoll !== null;

  const pollDate = usingApi
    ? String(apiPoll.date).slice(0, 10)
    : fallbackPoll?.date;
  const pollCutoff = usingApi
    ? String(apiPoll.cutoffTime)
    : fallbackPoll?.cutoffTime;
  const memberOptions: PublicMember[] = usingApi
    ? apiPoll.members
    : users.map((u) => ({ id: u.id, name: u.name, phone: u.phone }));

  const [selectedUser, setSelectedUser] = useState("");
  const [lunch, setLunch] = useState(1);
  const [dinner, setDinner] = useState(1);
  const [guest, setGuest] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Default to the first member until the voter picks a name (no effect needed).
  const effectiveUserId = selectedUser || memberOptions[0]?.id || "";

  const pollMissing = apiAttempted && !usingApi && !fallbackPoll;

  if (!apiAttempted || (!usingApi && !fallbackPoll && !pollMissing)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6">
          <h2 className="text-lg font-bold text-slate-200">Loading poll…</h2>
        </Card>
      </div>
    );
  }

  if (pollMissing) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6">
          <h2 className="text-lg font-bold text-rose-400">Invalid or Expired Poll Link</h2>
          <p className="text-xs text-slate-400 mt-2">Please ask your Mess Manager for an updated WhatsApp poll link.</p>
          <Link href="/" className="mt-4 inline-block text-xs font-bold text-emerald-400 underline">
            Go to Mess Dashboard
          </Link>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      if (usingApi) {
        await apiFetch(`/polls/${apiPoll.id}/vote`, {
          method: "POST",
          body: { userId: effectiveUserId, lunch, dinner, guest },
          auth: false,
        });
      } else if (fallbackPoll) {
        await castVote(fallbackPoll.id, effectiveUserId, lunch, dinner, guest);
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not submit vote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        {/* Top Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-2xl shadow-xl shadow-emerald-950/50 mb-2">
            🍽️
          </div>
          <h1 className="text-xl font-extrabold text-white">Shanti Nibash Hostel Mess</h1>
          <p className="text-xs text-emerald-400 font-medium">Daily Meal Voting Link</p>
        </div>

        <Card className="border-emerald-500/30 bg-slate-900/90 shadow-2xl p-6">
          <CardHeader className="p-0 mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-white">
                Daily Poll for {pollDate}
              </CardTitle>
              <Badge variant="emerald">ACTIVE POLL</Badge>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              Cutoff Time: <span className="text-amber-400 font-semibold">{pollCutoff}</span>
            </p>
          </CardHeader>

          <CardContent className="p-0">
            {submitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-white">Vote Submitted Successfully!</h3>
                <p className="text-xs text-slate-400">
                  Your meal count for {pollDate} has been updated in the Mess Manager dashboard.
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300">
                  Lunch: {lunch ? "YES" : "NO"} | Dinner: {dinner ? "YES" : "NO"} | Guest: +{guest}
                </div>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)} className="w-full">
                  Change Vote
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                    {submitError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Select Your Name</label>
                  <select
                    value={effectiveUserId}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800/90 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {memberOptions.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vote Options */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Lunch Meal</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLunch(lunch ? 0 : 1)}
                      className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${
                        lunch ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {lunch ? "EATING (YES)" : "NOT EATING (NO)"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">Dinner Meal</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDinner(dinner ? 0 : 1)}
                      className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${
                        dinner ? "bg-amber-600 text-white shadow-md shadow-amber-950/40" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {dinner ? "EATING (YES)" : "NOT EATING (NO)"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-400" />
                      <span className="text-xs font-bold text-white">Guest Meals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setGuest(Math.max(0, guest - 1))}
                        className="h-7 w-7 rounded-lg bg-slate-800 font-bold text-slate-300 hover:bg-slate-700"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-white px-2">+{guest}</span>
                      <button
                        type="button"
                        onClick={() => setGuest(guest + 1)}
                        className="h-7 w-7 rounded-lg bg-slate-800 font-bold text-slate-300 hover:bg-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <Button type="submit" variant="emerald" className="w-full mt-4 h-12 text-sm font-bold" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Vote"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Mess Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VoteTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  return (
    <LanguageProvider>
      <MessProvider>
        <DirectVoteContent token={resolvedParams.token} />
      </MessProvider>
    </LanguageProvider>
  );
}
