export interface ReportColumn {
  id: string;
  title: string;
}

export interface ReportExtras {
  carryover: Record<string, number>; // userId -> amount
  mealUtility: Record<string, number>; // userId -> amount (override, defaults to member totalCost)
  amountPaid: Record<string, number>; // userId -> amount (override, defaults to deposits)
}

export const DEFAULT_REPORT_COLUMNS: ReportColumn[] = [
  { id: "col_seat_rent", title: "Seat Rent" },
  { id: "col_gas_water", title: "Gas, Water & Dust" },
  { id: "col_maid_manager", title: "Maid & Manager" },
  { id: "col_electricity", title: "Electricity" },
  { id: "col_wifi", title: "Wifi" },
  { id: "col_kitchen_fan", title: "Kitchen Fan & Rice Pan" },
];

const COLUMNS_KEY = "mess_monthly_report_columns_v1";
const VALUES_KEY = "mess_monthly_report_values_v1";
const EXTRAS_KEY = "mess_monthly_report_extras_v1";

export type ReportValues = Record<string, Record<string, number>>; // userId -> columnId -> amount

export function loadReportColumns(): ReportColumn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COLUMNS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReportColumn[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c) => c && typeof c.id === "string" && typeof c.title === "string");
  } catch {
    return [];
  }
}

export function saveReportColumns(cols: ReportColumn[]) {
  try {
    localStorage.setItem(COLUMNS_KEY, JSON.stringify(cols));
  } catch {
    /* ignore */
  }
}

export function loadReportValues(): ReportValues {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(VALUES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ReportValues;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveReportValues(values: ReportValues) {
  try {
    localStorage.setItem(VALUES_KEY, JSON.stringify(values));
  } catch {
    /* ignore */
  }
}

export function loadReportExtras(): ReportExtras {
  const empty: ReportExtras = { carryover: {}, mealUtility: {}, amountPaid: {} };
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(EXTRAS_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as ReportExtras;
    return {
      carryover: parsed.carryover ?? {},
      mealUtility: parsed.mealUtility ?? {},
      amountPaid: parsed.amountPaid ?? {},
    };
  } catch {
    return empty;
  }
}

export function saveReportExtras(extras: ReportExtras) {
  try {
    localStorage.setItem(EXTRAS_KEY, JSON.stringify(extras));
  } catch {
    /* ignore */
  }
}

export function monthlyChargeForUser(
  userId: string,
  columns: ReportColumn[],
  values: ReportValues
): number {
  const row = values[userId] ?? {};
  return columns.reduce((sum, col) => sum + (Number(row[col.id]) || 0), 0);
}

export function balanceDue(
  monthlyCharge: number,
  carryover: number,
  mealUtility: number,
  amountPaid: number
): number {
  return monthlyCharge + carryover + mealUtility - amountPaid;
}
