"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Mess,
  User,
  MealPoll,
  BazarCost,
  UtilityCost,
  Deposit,
  BazarRoster,
  AuditLog,
  MemberSummary,
  Role,
  MealType,
  CostCategory,
} from "@/lib/types";
import {
  INITIAL_MESS,
  INITIAL_USERS,
  INITIAL_POLLS,
  INITIAL_BAZAR_COSTS,
  INITIAL_UTILITY_COSTS,
  INITIAL_DEPOSITS,
  INITIAL_ROSTER,
  INITIAL_AUDIT_LOGS,
} from "@/lib/mockData";
import {
  apiFetch,
  isApiReachable,
  getToken,
  setToken,
  clearToken,
  getStoredUserId,
  setStoredUserId,
} from "@/lib/api";

interface MessContextType {
  mess: Mess;
  users: User[];
  currentUser: User;
  isAuthenticated: boolean;
  /** True once the provider finished booting (API probe + initial load). */
  loading: boolean;
  /** True when talking to the NestJS API instead of local demo data. */
  apiMode: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginMember: (email: string, password: string) => Promise<boolean>;
  loginSuperAdmin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setCurrentUserRole: (role: Role) => Promise<void>;
  setCurrentUserId: (userId: string) => void;
  polls: MealPoll[];
  bazarCosts: BazarCost[];
  utilityCosts: UtilityCost[];
  deposits: Deposit[];
  roster: BazarRoster[];
  auditLogs: AuditLog[];

  // Calculated metrics
  totalBazarCost: number;
  totalMeals: number;
  mealRate: number;
  totalUtilityCost: number;
  utilityPerMember: number;
  memberSummaries: MemberSummary[];

  // Actions
  updateMessName: (name: string) => Promise<void>;
  updateMessCurrency: (currency: string) => Promise<void>;
  updateMessLogo: (logoUrl: string) => Promise<void>;
  createPoll: (date: string, mealType: MealType, cutoffTime: string) => Promise<void>;
  closePoll: (pollId: string) => Promise<void>;
  deletePoll: (pollId: string) => Promise<void>;
  castVote: (pollId: string, userId: string, lunch: number, dinner: number, guest: number) => Promise<void>;
  addBazarCost: (amount: number, description: string, paidById: string, receiptUrl?: string) => Promise<void>;
  updateBazarCost: (id: string, patch: Partial<Pick<BazarCost, "amount" | "description" | "paidById" | "receiptUrl" | "date">>) => Promise<void>;
  deleteBazarCost: (id: string) => Promise<void>;
  addUtilityCost: (title: string, amount: number, category: CostCategory, paidById: string) => Promise<void>;
  updateUtilityCost: (id: string, patch: Partial<Pick<UtilityCost, "title" | "amount" | "category" | "paidById" | "month" | "receiptUrl">>) => Promise<void>;
  deleteUtilityCost: (id: string) => Promise<void>;
  addDeposit: (userId: string, amount: number, method: "bKash" | "Nagad" | "Rocket" | "Cash" | "Bank", note?: string) => Promise<void>;
  updateDeposit: (id: string, patch: Partial<Pick<Deposit, "userId" | "amount" | "method" | "note">>) => Promise<void>;
  deleteDeposit: (id: string) => Promise<void>;
  assignBazarRoster: (userId: string, startDate: string, endDate: string) => Promise<void>;
  updateRosterEntry: (id: string, patch: Partial<Pick<BazarRoster, "userId" | "startDate" | "endDate" | "status">>) => Promise<void>;
  deleteRosterEntry: (id: string) => Promise<void>;
  updateMember: (id: string, patch: Partial<Pick<User, "name" | "phone" | "email" | "role">>) => Promise<void>;
  addMember: (name: string, phone: string, email: string, password: string, role: Role) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  resetToDemoData: () => void;
}

const MessContext = createContext<MessContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "mess_management_app_state_v2";

// ---------- API payload normalizers (Prisma JSON -> frontend types) ----------

interface ApiUser {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: Role;
  messId?: string | null;
  depositBalance: number;
}

interface ApiVote {
  id: string;
  pollId: string;
  userId: string;
  lunchCount: number;
  dinnerCount: number;
  guestCount: number;
  votedAt: string;
  user?: { id: string; name: string };
}

interface ApiPoll {
  id: string;
  messId: string;
  date: string;
  mealType: MealType;
  cutoffTime: string;
  isOpen: boolean;
  token: string;
  createdAt: string;
  votes: ApiVote[];
}

const mapUser = (u: ApiUser, fallbackMessId: string): User => ({
  id: u.id,
  name: u.name,
  phone: u.phone,
  email: u.email ?? undefined,
  role: u.role,
  messId: u.messId ?? fallbackMessId,
  depositBalance: u.depositBalance,
});

const mapPoll = (p: ApiPoll): MealPoll => ({
  id: p.id,
  messId: p.messId,
  date: typeof p.date === "string" ? p.date.slice(0, 10) : p.date,
  mealType: p.mealType,
  cutoffTime: typeof p.cutoffTime === "string" ? p.cutoffTime : String(p.cutoffTime),
  isOpen: p.isOpen,
  token: p.token,
  votes: (p.votes ?? []).map((v) => ({
    id: v.id,
    pollId: v.pollId,
    userId: v.userId,
    userName: v.user?.name,
    lunchCount: v.lunchCount,
    dinnerCount: v.dinnerCount,
    guestCount: v.guestCount,
    votedAt: typeof v.votedAt === "string" ? v.votedAt : String(v.votedAt),
  })),
  createdAt: typeof p.createdAt === "string" ? p.createdAt : String(p.createdAt),
});

export const MessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mess, setMess] = useState<Mess>(INITIAL_MESS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>("user_manager_1");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiMode, setApiMode] = useState<boolean>(false);

  const [polls, setPolls] = useState<MealPoll[]>(INITIAL_POLLS);
  const [bazarCosts, setBazarCosts] = useState<BazarCost[]>(INITIAL_BAZAR_COSTS);
  const [utilityCosts, setUtilityCosts] = useState<UtilityCost[]>(INITIAL_UTILITY_COSTS);
  const [deposits, setDeposits] = useState<Deposit[]>(INITIAL_DEPOSITS);
  const [roster, setRoster] = useState<BazarRoster[]>(INITIAL_ROSTER);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const apiModeRef = useRef(false);
  /** Set once the boot effect has finished (loaded API or local data). Gates persistence. */
  const bootedRef = useRef(false);

  // ----- API loaders -----

  const loadCollections = useCallback(async (messId: string) => {
    const [usersRes, pollsRes, bazarRes, utilityRes, depositsRes, rosterRes, auditRes] =
      await Promise.all([
        apiFetch<ApiUser[]>("/users"),
        apiFetch<ApiPoll[]>("/polls"),
        apiFetch<Array<Record<string, unknown>>>("/costs/bazar"),
        apiFetch<Array<Record<string, unknown>>>("/costs/utility"),
        apiFetch<Array<Record<string, unknown>>>("/deposits"),
        apiFetch<Array<Record<string, unknown>>>("/roster"),
        apiFetch<Array<Record<string, unknown>>>("/audit"),
      ]);

    const mappedUsers = usersRes.map((u) => mapUser(u, messId));
    setUsers(mappedUsers);
    setPolls(pollsRes.map(mapPoll));
    setBazarCosts(
      bazarRes.map((c) => {
        const paidBy = c.paidBy as { id: string; name: string } | undefined;
        return {
          id: String(c.id),
          messId: String(c.messId),
          date: String(c.date).slice(0, 10),
          amount: Number(c.amount),
          description: String(c.description),
          receiptUrl: (c.receiptUrl as string | null) ?? undefined,
          paidById: String(c.paidById),
          paidByName: paidBy?.name,
          createdAt: String(c.createdAt),
        } as BazarCost;
      })
    );
    setUtilityCosts(
      utilityRes.map((c) => {
        const paidBy = c.paidBy as { id: string; name: string } | undefined;
        return {
          id: String(c.id),
          messId: String(c.messId),
          month: String(c.month),
          category: c.category as CostCategory,
          title: String(c.title),
          amount: Number(c.amount),
          paidById: String(c.paidById),
          paidByName: paidBy?.name,
          receiptUrl: (c.receiptUrl as string | null) ?? undefined,
          createdAt: String(c.createdAt),
        } as UtilityCost;
      })
    );
    setDeposits(
      depositsRes.map((d) => {
        const member = d.user as { id: string; name: string } | undefined;
        return {
          id: String(d.id),
          messId: String(d.messId),
          userId: String(d.userId),
          userName: member?.name,
          amount: Number(d.amount),
          date: String(d.date).slice(0, 10),
          method: d.method as Deposit["method"],
          note: (d.note as string | null) ?? undefined,
        } as Deposit;
      })
    );
    setRoster(
      rosterRes.map((r) => {
        const member = r.user as { id: string; name: string } | undefined;
        return {
          id: String(r.id),
          messId: String(r.messId),
          userId: String(r.userId),
          userName: member?.name,
          startDate: String(r.startDate).slice(0, 10),
          endDate: String(r.endDate).slice(0, 10),
          status: r.status as BazarRoster["status"],
        } as BazarRoster;
      })
    );
    setAuditLogs(
      auditRes.map((l) => {
        const actor = l.actor as { id: string; name: string } | undefined;
        return {
          id: String(l.id),
          messId: String(l.messId),
          actorId: String(l.actorId),
          actorName: actor?.name ?? "System",
          action: String(l.action),
          details: String(l.details),
          createdAt: String(l.createdAt),
        } as AuditLog;
      })
    );

    // Resolve the active user: stored id wins, otherwise first member.
    const storedId = getStoredUserId();
    const activeId =
      storedId && mappedUsers.some((u) => u.id === storedId)
        ? storedId
        : mappedUsers[0]?.id ?? "";
    if (activeId) {
      setCurrentUserId(activeId);
      setStoredUserId(activeId);
    }
  }, []);

  const loadMess = useCallback(async () => {
    const m = await apiFetch<{ id: string; name: string; currency: string; managerId: string; logoUrl?: string | null; createdAt: string }>(
      "/mess/current"
    );
    setMess({ ...m, logoUrl: m.logoUrl ?? undefined, createdAt: String(m.createdAt) });
    return m.id;
  }, []);

  // ----- Boot: probe the API, fall back to local demo data when unreachable -----

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const reachable = await isApiReachable();
      if (cancelled) return;

      if (reachable) {
        apiModeRef.current = true;
        setApiMode(true);
        const token = getToken();
        if (token) {
          try {
            const me = await apiFetch<ApiUser>("/auth/me");
            const messId = await loadMess();
            await loadCollections(messId);
            if (!cancelled) {
              setCurrentUserId(me.id);
              setStoredUserId(me.id);
              setIsAuthenticated(true);
            }
          } catch {
            clearToken();
            if (!cancelled) setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } else {
        // Demo mode: local data + localStorage persistence (original behavior).
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.mess) setMess(parsed.mess);
            if (parsed.users) setUsers(parsed.users);
            if (parsed.polls) setPolls(parsed.polls);
            if (parsed.bazarCosts) setBazarCosts(parsed.bazarCosts);
            if (parsed.utilityCosts) setUtilityCosts(parsed.utilityCosts);
            if (parsed.deposits) setDeposits(parsed.deposits);
            if (parsed.roster) setRoster(parsed.roster);
            if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
            if (parsed.currentUserId) setCurrentUserId(parsed.currentUserId);
            if (typeof parsed.isAuthenticated === "boolean") setIsAuthenticated(parsed.isAuthenticated);
          }
        } catch (e) {
          console.warn("Could not load stored state", e);
        }
      }
      if (!cancelled) {
        bootedRef.current = true;
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadCollections, loadMess]);

  // Sync demo state to localStorage (demo mode only, and only after boot
  // has loaded — otherwise the initial mock state would wipe saved data).
  useEffect(() => {
    if (!bootedRef.current || apiModeRef.current) return;
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ mess, users, polls, bazarCosts, utilityCosts, deposits, roster, auditLogs, currentUserId, isAuthenticated })
      );
    } catch (e) {
      console.warn("Could not save state", e);
    }
  }, [mess, users, polls, bazarCosts, utilityCosts, deposits, roster, auditLogs, currentUserId, isAuthenticated]);

  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  // ----- Auth -----

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (apiModeRef.current) {
        try {
          const res = await apiFetch<{ accessToken: string; user: ApiUser }>("/auth/login", {
            method: "POST",
            body: { email: email.trim().toLowerCase(), password },
            auth: false,
          });
          setToken(res.accessToken);
          const messId = await loadMess();
          await loadCollections(messId);
          setCurrentUserId(res.user.id);
          setStoredUserId(res.user.id);
          setIsAuthenticated(true);
          return true;
        } catch {
          return false;
        }
      }
      const cleanEmail = email.trim().toLowerCase();
      const foundUser = users.find(
        (u) => u.email?.trim().toLowerCase() === cleanEmail
      );
      if (foundUser) {
        setCurrentUserId(foundUser.id);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    },
    [users, loadCollections, loadMess]
  );

  const loginMember = useCallback(
    (email: string, password: string) => login(email, password),
    [login]
  );

  const loginSuperAdmin = useCallback(
    (email: string, password: string) => login(email, password),
    [login]
  );

  const logout = useCallback(() => {
    clearToken();
    setIsAuthenticated(false);
  }, []);

  const setCurrentUserRole = useCallback(
    async (role: Role) => {
      if (apiModeRef.current) {
        try {
          await apiFetch(`/users/${currentUserId}`, { method: "PATCH", body: { role } });
          setUsers((prev) => prev.map((u) => (u.id === currentUserId ? { ...u, role } : u)));
        } catch (e) {
          console.warn("Could not update role on server", e);
        }
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === currentUserId ? { ...u, role } : u)));
    },
    [currentUserId]
  );

  // ----- Calculations (identical in both modes) -----

  const totalBazarCost = useMemo(() => {
    return bazarCosts.reduce((acc, c) => acc + c.amount, 0);
  }, [bazarCosts]);

  const totalUtilityCost = useMemo(() => {
    return utilityCosts.reduce((acc, c) => acc + c.amount, 0);
  }, [utilityCosts]);

  const utilityPerMember = useMemo(() => {
    return users.length > 0 ? totalUtilityCost / users.length : 0;
  }, [totalUtilityCost, users.length]);

  const memberSummaries: MemberSummary[] = useMemo(() => {
    const statsByUser: Record<
      string,
      { lunch: number; dinner: number; guest: number; totalMeals: number }
    > = {};

    users.forEach((u) => {
      statsByUser[u.id] = { lunch: 0, dinner: 0, guest: 0, totalMeals: 0 };
    });

    polls.forEach((poll) => {
      poll.votes.forEach((vote) => {
        if (!statsByUser[vote.userId]) {
          statsByUser[vote.userId] = { lunch: 0, dinner: 0, guest: 0, totalMeals: 0 };
        }
        statsByUser[vote.userId].lunch += vote.lunchCount;
        statsByUser[vote.userId].dinner += vote.dinnerCount;
        statsByUser[vote.userId].guest += vote.guestCount;
        statsByUser[vote.userId].totalMeals +=
          vote.lunchCount + vote.dinnerCount + vote.guestCount;
      });
    });

    const sumAllMeals = Object.values(statsByUser).reduce(
      (acc, curr) => acc + curr.totalMeals,
      0
    );

    const calculatedMealRate = sumAllMeals > 0 ? totalBazarCost / sumAllMeals : 0;

    return users.map((user) => {
      const uStats = statsByUser[user.id] || { lunch: 0, dinner: 0, guest: 0, totalMeals: 0 };
      const bazarCostShare = uStats.totalMeals * calculatedMealRate;
      const utilityShare = utilityPerMember;
      const totalCost = bazarCostShare + utilityShare;

      const userDeposits = deposits
        .filter((d) => d.userId === user.id)
        .reduce((acc, d) => acc + d.amount, 0);

      const netBalance = userDeposits - totalCost;

      return {
        user,
        totalMeals: uStats.totalMeals,
        lunchMeals: uStats.lunch,
        dinnerMeals: uStats.dinner,
        guestMeals: uStats.guest,
        bazarCostShare,
        utilityShare,
        totalCost,
        totalDeposited: userDeposits,
        netBalance,
      };
    });
  }, [users, polls, totalBazarCost, utilityPerMember, deposits]);

  const totalMeals = useMemo(() => {
    return memberSummaries.reduce((acc, m) => acc + m.totalMeals, 0);
  }, [memberSummaries]);

  const mealRate = useMemo(() => {
    return totalMeals > 0 ? totalBazarCost / totalMeals : 0;
  }, [totalBazarCost, totalMeals]);

  // ----- Action methods (API-first, demo fallback) -----

  const logAuditLocal = useCallback((action: string, details: string, actor: User) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      messId: mess.id,
      actorId: actor.id,
      actorName: actor.name,
      action,
      details,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, [mess.id]);

  const refreshPollsAndAudit = useCallback(async () => {    const [pollsRes, auditRes] = await Promise.all([
      apiFetch<ApiPoll[]>("/polls"),
      apiFetch<Array<Record<string, unknown>>>("/audit"),
    ]);
    setPolls(pollsRes.map(mapPoll));
    setAuditLogs(
      auditRes.map((l) => {
        const actor = l.actor as { id: string; name: string } | undefined;
        return {
          id: String(l.id),
          messId: String(l.messId),
          actorId: String(l.actorId),
          actorName: actor?.name ?? "System",
          action: String(l.action),
          details: String(l.details),
          createdAt: String(l.createdAt),
        } as AuditLog;
      })
    );
  }, []);

  const updateMessName = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      if (apiModeRef.current) {
        const updated = await apiFetch<{ name: string }>("/mess/current", {
          method: "PATCH",
          body: { name: trimmed },
        });
        setMess((prev) => ({ ...prev, name: updated.name }));
        return;
      }
      setMess((prev) => ({ ...prev, name: trimmed }));
    },
    []
  );

  const updateMessCurrency = useCallback(
    async (currency: string) => {
      const trimmed = currency.trim();
      if (!trimmed) return;
      if (apiModeRef.current) {
        const updated = await apiFetch<{ currency: string }>("/mess/current", {
          method: "PATCH",
          body: { currency: trimmed },
        });
        setMess((prev) => ({ ...prev, currency: updated.currency }));
        return;
      }
      setMess((prev) => ({ ...prev, currency: trimmed }));
    },
    []
  );

  const updateMessLogo = useCallback(
    async (logoUrl: string) => {
      const trimmed = logoUrl.trim();
      if (apiModeRef.current) {
        const updated = await apiFetch<{ logoUrl: string | null }>("/mess/current", {
          method: "PATCH",
          body: { logoUrl: trimmed },
        });
        setMess((prev) => ({ ...prev, logoUrl: updated.logoUrl ?? undefined }));
        return;
      }
      setMess((prev) => ({ ...prev, logoUrl: trimmed || undefined }));
    },
    []
  );

  const createPoll = useCallback(    async (date: string, mealType: MealType, cutoffTime: string) => {
      if (apiModeRef.current) {
        await apiFetch("/polls", { method: "POST", body: { date, mealType, cutoffTime } });
        await refreshPollsAndAudit();
        return;
      }
      const newPoll: MealPoll = {
        id: `poll_${Date.now()}`,
        messId: mess.id,
        date,
        mealType,
        cutoffTime,
        isOpen: true,
        token: `token_${Date.now().toString(36)}`,
        votes: [],
        createdAt: new Date().toISOString(),
      };
      setPolls((prev) => [newPoll, ...prev]);
      logAuditLocal("POLL_CREATED", `Created daily meal poll for ${date} (${mealType})`, currentUser);
    },
    [mess.id, currentUser, refreshPollsAndAudit, logAuditLocal]
  );

  const castVote = useCallback(
    async (pollId: string, userId: string, lunch: number, dinner: number, guest: number) => {
      if (apiModeRef.current) {
        await apiFetch(`/polls/${pollId}/vote`, {
          method: "POST",
          body: { userId, lunch, dinner, guest },
        });
        await refreshPollsAndAudit();
        return;
      }
      const userObj = users.find((u) => u.id === userId);
      const userName = userObj ? userObj.name : "Member";
      setPolls((prev) =>
        prev.map((poll) => {
          if (poll.id !== pollId) return poll;
          const existingIndex = poll.votes.findIndex((v) => v.userId === userId);
          const updatedVotes = [...poll.votes];
          if (existingIndex >= 0) {
            updatedVotes[existingIndex] = {
              ...updatedVotes[existingIndex],
              lunchCount: lunch,
              dinnerCount: dinner,
              guestCount: guest,
              votedAt: new Date().toISOString(),
            };
          } else {
            updatedVotes.push({
              id: `vote_${Date.now()}`,
              pollId,
              userId,
              userName,
              lunchCount: lunch,
              dinnerCount: dinner,
              guestCount: guest,
              votedAt: new Date().toISOString(),
            });
          }
          return { ...poll, votes: updatedVotes };
        })
      );
      logAuditLocal("MEAL_VOTED", `${userName} voted: Lunch=${lunch}, Dinner=${dinner}, Guest=${guest}`, currentUser);
    },
    [users, currentUser, refreshPollsAndAudit, logAuditLocal]
  );

  const addBazarCost = useCallback(
    async (amount: number, description: string, paidById: string, receiptUrl?: string) => {
      if (apiModeRef.current) {
        await apiFetch("/costs/bazar", { method: "POST", body: { amount, description, paidById, receiptUrl } });
        const [list, auditRes] = await Promise.all([
          apiFetch<Array<Record<string, unknown>>>("/costs/bazar"),
          apiFetch<Array<Record<string, unknown>>>("/audit"),
        ]);
        setBazarCosts(
          list.map((c) => {
            const paidBy = c.paidBy as { id: string; name: string } | undefined;
            return {
              id: String(c.id),
              messId: String(c.messId),
              date: String(c.date).slice(0, 10),
              amount: Number(c.amount),
              description: String(c.description),
              receiptUrl: (c.receiptUrl as string | null) ?? undefined,
              paidById: String(c.paidById),
              paidByName: paidBy?.name,
              createdAt: String(c.createdAt),
            } as BazarCost;
          })
        );
        setAuditLogs(
          auditRes.map((l) => {
            const actor = l.actor as { id: string; name: string } | undefined;
            return {
              id: String(l.id),
              messId: String(l.messId),
              actorId: String(l.actorId),
              actorName: actor?.name ?? "System",
              action: String(l.action),
              details: String(l.details),
              createdAt: String(l.createdAt),
            } as AuditLog;
          })
        );
        return;
      }
      const payer = users.find((u) => u.id === paidById);
      const newCost: BazarCost = {
        id: `bazar_${Date.now()}`,
        messId: mess.id,
        date: new Date().toISOString().split("T")[0],
        amount,
        description,
        paidById,
        paidByName: payer ? payer.name : "Member",
        receiptUrl: receiptUrl || "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80",
        createdAt: new Date().toISOString(),
      };
      setBazarCosts((prev) => [newCost, ...prev]);
      logAuditLocal("BAZAR_COST_ADDED", `Logged Bazar expense ৳${amount} for "${description}"`, currentUser);
    },
    [users, mess.id, currentUser, logAuditLocal]
  );

  const addUtilityCost = useCallback(
    async (title: string, amount: number, category: CostCategory, paidById: string) => {
      if (apiModeRef.current) {
        await apiFetch("/costs/utility", { method: "POST", body: { title, amount, category, paidById } });
        const list = await apiFetch<Array<Record<string, unknown>>>("/costs/utility");
        setUtilityCosts(
          list.map((c) => {
            const paidBy = c.paidBy as { id: string; name: string } | undefined;
            return {
              id: String(c.id),
              messId: String(c.messId),
              month: String(c.month),
              category: c.category as CostCategory,
              title: String(c.title),
              amount: Number(c.amount),
              paidById: String(c.paidById),
              paidByName: paidBy?.name,
              receiptUrl: (c.receiptUrl as string | null) ?? undefined,
              createdAt: String(c.createdAt),
            } as UtilityCost;
          })
        );
        return;
      }
      const payer = users.find((u) => u.id === paidById);
      const newCost: UtilityCost = {
        id: `util_${Date.now()}`,
        messId: mess.id,
        month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        category,
        title,
        amount,
        paidById,
        paidByName: payer ? payer.name : "Member",
        createdAt: new Date().toISOString(),
      };
      setUtilityCosts((prev) => [newCost, ...prev]);
      logAuditLocal("UTILITY_COST_ADDED", `Logged Utility cost ৳${amount} for "${title}"`, currentUser);
    },
    [users, mess.id, currentUser, logAuditLocal]
  );

  const addDeposit = useCallback(
    async (
      userId: string,
      amount: number,
      method: "bKash" | "Nagad" | "Rocket" | "Cash" | "Bank",
      note?: string
    ) => {
      if (apiModeRef.current) {
        await apiFetch("/deposits", { method: "POST", body: { userId, amount, method, note } });
        const list = await apiFetch<Array<Record<string, unknown>>>("/deposits");
        setDeposits(
          list.map((d) => {
            const member = d.user as { id: string; name: string } | undefined;
            return {
              id: String(d.id),
              messId: String(d.messId),
              userId: String(d.userId),
              userName: member?.name,
              amount: Number(d.amount),
              date: String(d.date).slice(0, 10),
              method: d.method as Deposit["method"],
              note: (d.note as string | null) ?? undefined,
            } as Deposit;
          })
        );
        return;
      }
      const userObj = users.find((u) => u.id === userId);
      const newDeposit: Deposit = {
        id: `dep_${Date.now()}`,
        messId: mess.id,
        userId,
        userName: userObj ? userObj.name : "Member",
        amount,
        date: new Date().toISOString().split("T")[0],
        method,
        note: note || "Deposit recorded",
      };
      setDeposits((prev) => [newDeposit, ...prev]);
      logAuditLocal("DEPOSIT_ADDED", `Recorded deposit ৳${amount} for ${userObj?.name} via ${method}`, currentUser);
    },
    [users, mess.id, currentUser, logAuditLocal]
  );

  const assignBazarRoster = useCallback(
    async (userId: string, startDate: string, endDate: string) => {
      if (apiModeRef.current) {
        await apiFetch("/roster", { method: "POST", body: { userId, startDate, endDate } });
        const list = await apiFetch<Array<Record<string, unknown>>>("/roster");
        setRoster(
          list.map((r) => {
            const member = r.user as { id: string; name: string } | undefined;
            return {
              id: String(r.id),
              messId: String(r.messId),
              userId: String(r.userId),
              userName: member?.name,
              startDate: String(r.startDate).slice(0, 10),
              endDate: String(r.endDate).slice(0, 10),
              status: r.status as BazarRoster["status"],
            } as BazarRoster;
          })
        );
        return;
      }
      const userObj = users.find((u) => u.id === userId);
      const newEntry: BazarRoster = {
        id: `ros_${Date.now()}`,
        messId: mess.id,
        userId,
        userName: userObj ? userObj.name : "Member",
        startDate,
        endDate,
        status: "PENDING",
      };
      setRoster((prev) => [newEntry, ...prev]);
      logAuditLocal("ROSTER_ASSIGNED", `Assigned Bazar duty to ${userObj?.name} (${startDate} to ${endDate})`, currentUser);
    },
    [users, mess.id, currentUser, logAuditLocal]
  );

  const closePoll = useCallback(
    async (pollId: string) => {
      if (apiModeRef.current) {
        await apiFetch(`/polls/${pollId}/close`, { method: "PATCH" });
        await refreshPollsAndAudit();
        return;
      }
      setPolls((prev) => prev.map((p) => (p.id === pollId ? { ...p, isOpen: false } : p)));
      logAuditLocal("POLL_CLOSED", `Closed meal poll ${pollId}`, currentUser);
    },
    [refreshPollsAndAudit, currentUser, logAuditLocal]
  );

  const deletePoll = useCallback(
    async (pollId: string) => {
      if (apiModeRef.current) {
        await apiFetch(`/polls/${pollId}`, { method: "DELETE" });
        await refreshPollsAndAudit();
        return;
      }
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
      logAuditLocal("POLL_REMOVED", `Removed meal poll ${pollId}`, currentUser);
    },
    [refreshPollsAndAudit, currentUser, logAuditLocal]
  );

  const updateBazarCost = useCallback(
    async (id: string, patch: Partial<Pick<BazarCost, "amount" | "description" | "paidById" | "receiptUrl" | "date">>) => {
      if (apiModeRef.current) {
        await apiFetch(`/costs/bazar/${id}`, { method: "PATCH", body: patch });
        const list = await apiFetch<Array<Record<string, unknown>>>("/costs/bazar");
        setBazarCosts(
          list.map((c) => {
            const paidBy = c.paidBy as { id: string; name: string } | undefined;
            return {
              id: String(c.id),
              messId: String(c.messId),
              date: String(c.date).slice(0, 10),
              amount: Number(c.amount),
              description: String(c.description),
              receiptUrl: (c.receiptUrl as string | null) ?? undefined,
              paidById: String(c.paidById),
              paidByName: paidBy?.name,
              createdAt: String(c.createdAt),
            } as BazarCost;
          })
        );
        return;
      }
      setBazarCosts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      logAuditLocal("BAZAR_COST_UPDATED", `Updated Bazar expense ${id}`, currentUser);
    },
    [currentUser, logAuditLocal]
  );

  const deleteBazarCost = useCallback(
    async (id: string) => {
      if (apiModeRef.current) {
        await apiFetch(`/costs/bazar/${id}`, { method: "DELETE" });
        setBazarCosts((prev) => prev.filter((c) => c.id !== id));
        return;
      }
      setBazarCosts((prev) => prev.filter((c) => c.id !== id));
      logAuditLocal("BAZAR_COST_REMOVED", `Removed Bazar expense ${id}`, currentUser);
    },
    [currentUser, logAuditLocal]
  );

  const updateUtilityCost = useCallback(
    async (id: string, patch: Partial<Pick<UtilityCost, "title" | "amount" | "category" | "paidById" | "month" | "receiptUrl">>) => {
      if (apiModeRef.current) {
        await apiFetch(`/costs/utility/${id}`, { method: "PATCH", body: patch });
        const list = await apiFetch<Array<Record<string, unknown>>>("/costs/utility");
        setUtilityCosts(
          list.map((c) => {
            const paidBy = c.paidBy as { id: string; name: string } | undefined;
            return {
              id: String(c.id),
              messId: String(c.messId),
              month: String(c.month),
              category: c.category as CostCategory,
              title: String(c.title),
              amount: Number(c.amount),
              paidById: String(c.paidById),
              paidByName: paidBy?.name,
              receiptUrl: (c.receiptUrl as string | null) ?? undefined,
              createdAt: String(c.createdAt),
            } as UtilityCost;
          })
        );
        return;
      }
      setUtilityCosts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      logAuditLocal("UTILITY_COST_UPDATED", `Updated Utility cost ${id}`, currentUser);
    },
    [currentUser, logAuditLocal]
  );

  const deleteUtilityCost = useCallback(
    async (id: string) => {
      if (apiModeRef.current) {
        await apiFetch(`/costs/utility/${id}`, { method: "DELETE" });
        setUtilityCosts((prev) => prev.filter((c) => c.id !== id));
        return;
      }
      setUtilityCosts((prev) => prev.filter((c) => c.id !== id));
      logAuditLocal("UTILITY_COST_REMOVED", `Removed Utility cost ${id}`, currentUser);
    },
    [currentUser, logAuditLocal]
  );

  const updateDeposit = useCallback(
    async (id: string, patch: Partial<Pick<Deposit, "userId" | "amount" | "method" | "note">>) => {
      if (apiModeRef.current) {
        await apiFetch(`/deposits/${id}`, { method: "PATCH", body: patch });
        const list = await apiFetch<Array<Record<string, unknown>>>("/deposits");
        setDeposits(
          list.map((d) => {
            const member = d.user as { id: string; name: string } | undefined;
            return {
              id: String(d.id),
              messId: String(d.messId),
              userId: String(d.userId),
              userName: member?.name,
              amount: Number(d.amount),
              date: String(d.date).slice(0, 10),
              method: d.method as Deposit["method"],
              note: (d.note as string | null) ?? undefined,
            } as Deposit;
          })
        );
        return;
      }
      setDeposits((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
      logAuditLocal("DEPOSIT_UPDATED", `Updated deposit ${id}`, currentUser);
    },
    [currentUser, logAuditLocal]
  );

  const deleteDeposit = useCallback(
    async (id: string) => {
      if (apiModeRef.current) {
        await apiFetch(`/deposits/${id}`, { method: "DELETE" });
        setDeposits((prev) => prev.filter((d) => d.id !== id));
        return;
      }
      setDeposits((prev) => prev.filter((d) => d.id !== id));
      logAuditLocal("DEPOSIT_REMOVED", `Removed deposit ${id}`, currentUser);
    },
    [currentUser, logAuditLocal]
  );

  const updateRosterEntry = useCallback(
    async (id: string, patch: Partial<Pick<BazarRoster, "userId" | "startDate" | "endDate" | "status">>) => {
      if (apiModeRef.current) {
        await apiFetch(`/roster/${id}`, { method: "PATCH", body: patch });
        const list = await apiFetch<Array<Record<string, unknown>>>("/roster");
        setRoster(
          list.map((r) => {
            const member = r.user as { id: string; name: string } | undefined;
            return {
              id: String(r.id),
              messId: String(r.messId),
              userId: String(r.userId),
              userName: member?.name,
              startDate: String(r.startDate).slice(0, 10),
              endDate: String(r.endDate).slice(0, 10),
              status: r.status as BazarRoster["status"],
            } as BazarRoster;
          })
        );
        return;
      }
      setRoster((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
      logAuditLocal("ROSTER_UPDATED", `Updated Bazar duty ${id}`, currentUser);
    },
    [currentUser, logAuditLocal]
  );

  const deleteRosterEntry = useCallback(
    async (id: string) => {
      if (apiModeRef.current) {
        await apiFetch(`/roster/${id}`, { method: "DELETE" });
        setRoster((prev) => prev.filter((r) => r.id !== id));
        return;
      }
      setRoster((prev) => prev.filter((r) => r.id !== id));
      logAuditLocal("ROSTER_REMOVED", `Removed Bazar duty ${id}`, currentUser);
    },
    [currentUser, logAuditLocal]
  );

  const updateMember = useCallback(
    async (id: string, patch: Partial<Pick<User, "name" | "phone" | "email" | "role">>) => {
      if (apiModeRef.current) {
        await apiFetch(`/users/${id}`, { method: "PATCH", body: patch });
        const list = await apiFetch<ApiUser[]>("/users");
        setUsers(list.map((u) => mapUser(u, mess.id)));
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
      logAuditLocal("MEMBER_UPDATED", `Updated member ${id}`, currentUser);
    },
    [mess.id, currentUser, logAuditLocal]
  );

  const deleteMember = useCallback(
    async (id: string) => {
      if (apiModeRef.current) {
        await apiFetch(`/users/${id}`, { method: "DELETE" });
        const list = await apiFetch<ApiUser[]>("/users");
        setUsers(list.map((u) => mapUser(u, mess.id)));
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      logAuditLocal("MEMBER_REMOVED", `Removed member ${id}`, currentUser);
    },
    [mess.id, currentUser, logAuditLocal]
  );

  const addMember = useCallback(
    async (name: string, phone: string, email: string, password: string, role: Role) => {
      if (apiModeRef.current) {
        await apiFetch("/users", { method: "POST", body: { name, phone, email, password, role } });
        const list = await apiFetch<ApiUser[]>("/users");
        setUsers(list.map((u) => mapUser(u, mess.id)));
        return;
      }
      const newUser: User = {
        id: `user_${Date.now()}`,
        name,
        phone,
        email,
        role,
        messId: mess.id,
        depositBalance: 0,
      };
      setUsers((prev) => [...prev, newUser]);
      logAuditLocal("MEMBER_ADDED", `Enrolled ${name} (${phone})`, currentUser);
    },
    [mess.id, currentUser, logAuditLocal]
  );

  const resetToDemoData = useCallback(() => {    clearToken();
    apiModeRef.current = false;
    setApiMode(false);
    setMess(INITIAL_MESS);
    setUsers(INITIAL_USERS);
    setCurrentUserId("user_manager_1");
    setIsAuthenticated(true);
    setPolls(INITIAL_POLLS);
    setBazarCosts(INITIAL_BAZAR_COSTS);
    setUtilityCosts(INITIAL_UTILITY_COSTS);
    setDeposits(INITIAL_DEPOSITS);
    setRoster(INITIAL_ROSTER);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <MessContext.Provider
      value={{
        mess,
        users,
        currentUser,
        isAuthenticated,
        loading,
        apiMode,
        login,
        loginMember,
        loginSuperAdmin,
        logout,
        setCurrentUserRole,
        setCurrentUserId,
        polls,
        bazarCosts,
        utilityCosts,
        deposits,
        roster,
        auditLogs,
        totalBazarCost,
        totalMeals,
        mealRate,
        totalUtilityCost,
        utilityPerMember,
        memberSummaries,
        updateMessName,
        updateMessCurrency,
        updateMessLogo,
        createPoll,
        closePoll,
        deletePoll,
        castVote,
        addBazarCost,
        updateBazarCost,
        deleteBazarCost,
        addUtilityCost,
        updateUtilityCost,
        deleteUtilityCost,
        addDeposit,
        updateDeposit,
        deleteDeposit,
        assignBazarRoster,
        updateRosterEntry,
        deleteRosterEntry,
        updateMember,
        addMember,
        deleteMember,
        resetToDemoData,
      }}
    >
      {children}
    </MessContext.Provider>
  );
};

export function useMess() {
  const context = useContext(MessContext);
  if (!context) {
    throw new Error("useMess must be used within a MessProvider");
  }
  return context;
}
