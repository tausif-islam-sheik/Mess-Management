"use client";

import React, { useState } from "react";
import { useMess } from "@/context/MessContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Vote, Plus, Share2, MessageSquare, Check, X, Clock, ExternalLink, Send, CheckCircle2, Users, BarChart3, Trash2, Lock } from "lucide-react";
import { MealType } from "@/lib/types";
import { StatsCards } from "@/components/Dashboard/StatsCards";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export const PollManager: React.FC = () => {
  const { polls, createPoll, closePoll, deletePoll, castVote, users, currentUser } = useMess();
  const { t } = useLanguage();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pollDate, setPollDate] = useState(new Date().toISOString().split("T")[0]);
  const [mealType, setMealType] = useState<MealType>("BOTH");
  const [cutoffTime, setCutoffTime] = useState("10:00 AM");

  const [sharePollModal, setSharePollModal] = useState<string | null>(null);
  const [createError, setCreateError] = useState("");
  const [deletePollId, setDeletePollId] = useState<string | null>(null);

  const activePoll = polls.find((p) => p.isOpen) || polls[0];
  const openCount = polls.filter((p) => p.isOpen).length;
  const totalVotes = polls.reduce((sum, p) => sum + p.votes.length, 0);
  const activeVotes = activePoll ? activePoll.votes.length : 0;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    try {
      await createPoll(pollDate, mealType, cutoffTime);
      setIsCreateOpen(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create poll. Please try again.");
    }
  };

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Vote className="h-6 w-6 text-emerald-400" />
            {t.polls.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">{t.polls.subtitle}</p>
        </div>

        <Button variant="emerald" onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t.polls.createNew}
        </Button>
      </div>

      {/* Stats */}
      <StatsCards
        items={[
          {
            title: "Total Polls",
            value: String(polls.length),
            subtext: "All time",
            icon: BarChart3,
            color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
          },
          {
            title: "Open Polls",
            value: String(openCount),
            subtext: "Accepting votes",
            icon: CheckCircle2,
            color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
          },
          {
            title: "Total Votes",
            value: String(totalVotes),
            subtext: "Across all polls",
            icon: Vote,
            color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400",
          },
          {
            title: "Active Poll Votes",
            value: `${activeVotes}/${users.length}`,
            subtext: "Members voted",
            icon: Users,
            color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
          },
        ]}
      />

      {/* Active Poll Card */}
      {activePoll && (
        <Card className="border-emerald-500/30 bg-slate-900/90 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-white">
                  Daily Poll for {activePoll.date}
                </CardTitle>
                <Badge variant={activePoll.isOpen ? "emerald" : "default"}>
                  {activePoll.isOpen ? t.polls.open : t.polls.closed}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                {t.polls.cutoff}: <span className="text-amber-400 font-semibold">{activePoll.cutoffTime}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* TODO: WhatsApp integration coming soon — re-enable share link */}
              <button
                type="button"
                disabled
                title="WhatsApp integration coming soon"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-400 cursor-not-allowed opacity-70 border border-slate-700"
              >
                <Share2 className="h-4 w-4" />
                {t.polls.shareWhatsApp}
                <span className="rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] px-1.5 py-0.5 font-bold">
                  Coming Soon
                </span>
              </button>

              <a
                href={`${currentOrigin}/vote/${activePoll.token}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
                Public Voting Link
              </a>

              {activePoll.isOpen && (
                <button
                  type="button"
                  onClick={() => closePoll(activePoll.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Close Poll
                </button>
              )}

              <button
                type="button"
                onClick={() => setDeletePollId(activePoll.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              Voting Status Matrix ({activePoll.votes.length} / {users.length} Voted)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => {
                const userVote = activePoll.votes.find((v) => v.userId === user.id);
                const hasVoted = !!userVote;
                const isMe = user.id === currentUser.id;

                return (
                  <div
                    key={user.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      hasVoted
                        ? "bg-slate-900/80 border-slate-800"
                        : "bg-amber-950/20 border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                          alt={user.name}
                          className="h-8 w-8 rounded-full border border-slate-700 object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1">
                            {user.name} {isMe && <span className="text-[10px] text-emerald-400 font-semibold">(You)</span>}
                          </div>
                          <div className="text-[10px] text-slate-400">{user.role}</div>
                        </div>
                      </div>

                      {hasVoted ? (
                        <Badge variant="emerald" className="flex items-center gap-1 text-[10px]">
                          <Check className="h-3 w-3" /> Voted
                        </Badge>
                      ) : (
                        <span
                          title="WhatsApp reminder coming soon"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700 cursor-not-allowed opacity-70"
                        >
                          <Send className="h-2.5 w-2.5" /> Ping WA · Soon
                        </span>
                      )}
                    </div>

                    {/* Quick Vote Controls for Current User or Manager */}
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <button
                          onClick={() => castVote(activePoll.id, user.id, userVote?.lunchCount ? 0 : 1, userVote?.dinnerCount || 0, userVote?.guestCount || 0)}
                          className={`py-1 px-2 rounded-lg font-bold text-[11px] transition-colors ${
                            userVote?.lunchCount ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                          }`}
                        >
                          Lunch: {userVote?.lunchCount ? "YES" : "NO"}
                        </button>

                        <button
                          onClick={() => castVote(activePoll.id, user.id, userVote?.lunchCount || 0, userVote?.dinnerCount ? 0 : 1, userVote?.guestCount || 0)}
                          className={`py-1 px-2 rounded-lg font-bold text-[11px] transition-colors ${
                            userVote?.dinnerCount ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                          }`}
                        >
                          Dinner: {userVote?.dinnerCount ? "YES" : "NO"}
                        </button>

                        <div className="flex items-center justify-center gap-1 bg-slate-800 rounded-lg text-slate-300 font-bold px-1 text-[11px]">
                          <button
                            onClick={() => castVote(activePoll.id, user.id, userVote?.lunchCount || 0, userVote?.dinnerCount || 0, Math.max(0, (userVote?.guestCount || 0) - 1))}
                            className="px-1 text-slate-400 hover:text-white"
                          >
                            -
                          </button>
                          <span>+{userVote?.guestCount || 0} G</span>
                          <button
                            onClick={() => castVote(activePoll.id, user.id, userVote?.lunchCount || 0, userVote?.dinnerCount || 0, (userVote?.guestCount || 0) + 1)}
                            className="px-1 text-slate-400 hover:text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Poll Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={t.polls.createNew}
        description="Schedule daily meal poll and share the public voting link."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {createError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Poll Date</label>
            <Input type="date" value={pollDate} onChange={(e) => setPollDate(e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.polls.type}</label>
            <Select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
              <option value="BOTH">Lunch & Dinner (Both)</option>
              <option value="LUNCH">Lunch Only</option>
              <option value="DINNER">Dinner Only</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.polls.cutoff}</label>
            <Input type="text" value={cutoffTime} onChange={(e) => setCutoffTime(e.target.value)} placeholder="e.g. 10:00 AM" required />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald">
              Create & Share Poll
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deletePollId}
        title="Delete poll?"
        message="This poll and all its votes will be permanently removed."
        onCancel={() => setDeletePollId(null)}
        onConfirm={async () => {
          if (deletePollId) await deletePoll(deletePollId);
          setDeletePollId(null);
        }}
      />
    </div>
  );
};
