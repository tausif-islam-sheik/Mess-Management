import { Mess, User, MealPoll, BazarCost, UtilityCost, Deposit, BazarRoster, AuditLog } from "./types";

export const INITIAL_MESS: Mess = {
  id: "mess_default",
  name: "New Shared Mess Group",
  currency: "BDT",
  managerId: "user_super_admin",
  logoUrl: undefined,
  createdAt: new Date().toISOString(),
};

// ONLY Super Admin is seeded by default
export const INITIAL_USERS: User[] = [
  {
    id: "user_super_admin",
    name: "System Super Admin",
    phone: "+8801999999999",
    email: "admin@messmanager.com",
    role: "SUPER_ADMIN",
    messId: "mess_default",
    depositBalance: 0,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
  },
];

export const INITIAL_POLLS: MealPoll[] = [];
export const INITIAL_BAZAR_COSTS: BazarCost[] = [];
export const INITIAL_UTILITY_COSTS: UtilityCost[] = [];
export const INITIAL_DEPOSITS: Deposit[] = [];
export const INITIAL_ROSTER: BazarRoster[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log_init",
    messId: "mess_default",
    actorId: "user_super_admin",
    actorName: "System Super Admin",
    action: "SYSTEM_INITIALIZED",
    details: "System initialized with Super Admin account.",
    createdAt: new Date().toISOString(),
  },
];
