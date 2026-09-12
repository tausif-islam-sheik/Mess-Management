export type Role = "SUPER_ADMIN" | "MANAGER" | "BAZAR_MANAGER" | "MEMBER";

export type MealType = "LUNCH" | "DINNER" | "BOTH";

export type CostCategory = "BAZAR" | "UTILITY" | "REPAIR" | "OTHER";

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  messId: string;
  depositBalance: number;
  avatarUrl?: string;
}

export interface Mess {
  id: string;
  name: string;
  currency: string;
  managerId: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  pollId: string;
  userId: string;
  userName?: string;
  lunchCount: number;
  dinnerCount: number;
  guestCount: number;
  votedAt: string;
}

export interface MealPoll {
  id: string;
  messId: string;
  date: string;
  mealType: MealType;
  cutoffTime: string;
  isOpen: boolean;
  token: string;
  votes: Vote[];
  createdAt: string;
}

export interface BazarCost {
  id: string;
  messId: string;
  date: string;
  amount: number;
  description: string;
  receiptUrl?: string;
  paidById: string;
  paidByName?: string;
  createdAt: string;
}

export interface UtilityCost {
  id: string;
  messId: string;
  month: string;
  category: CostCategory;
  title: string;
  amount: number;
  paidById: string;
  paidByName?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface Deposit {
  id: string;
  messId: string;
  userId: string;
  userName?: string;
  amount: number;
  date: string;
  method: "bKash" | "Nagad" | "Rocket" | "Cash" | "Bank";
  note?: string;
}

export interface BazarRoster {
  id: string;
  messId: string;
  userId: string;
  userName?: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED";
}

export interface AuditLog {
  id: string;
  messId: string;
  actorId: string;
  actorName: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface MemberSummary {
  user: User;
  totalMeals: number;
  lunchMeals: number;
  dinnerMeals: number;
  guestMeals: number;
  bazarCostShare: number;
  utilityShare: number;
  totalCost: number;
  totalDeposited: number;
  netBalance: number; // Positive = Surplus, Negative = Due
}
