import * as XLSX from "xlsx";
import { MemberSummary, BazarCost, UtilityCost } from "./types";

export function exportMonthlyReportToExcel(
  monthYear: string,
  messName: string,
  totalBazarCost: number,
  totalMeals: number,
  mealRate: number,
  totalUtilityCost: number,
  memberSummaries: MemberSummary[],
  bazarCosts: BazarCost[],
  utilityCosts: UtilityCost[]
) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Executive Summary & Member Balances
  const summaryRows = [
    ["MESS MONTHLY REPORT", monthYear.toUpperCase()],
    ["Mess Name", messName],
    ["Generated At", new Date().toLocaleString()],
    [],
    ["METRICS SUMMARY", ""],
    ["Total Bazar Expenses", totalBazarCost],
    ["Total Meals Consumed", totalMeals],
    ["Calculated Meal Rate", mealRate],
    ["Total Utility & Misc", totalUtilityCost],
    [],
    ["MEMBER FINANCIAL BREAKDOWN", "", "", "", "", "", "", ""],
    [
      "Member Name",
      "Phone",
      "Lunch Meals",
      "Dinner Meals",
      "Guest Meals",
      "Total Meals",
      "Meal Cost",
      "Utility Share",
      "Total Cost",
      "Deposits Paid",
      "Net Balance (Surplus / Due)",
    ],
    ...memberSummaries.map((m) => [
      m.user.name,
      m.user.phone,
      m.lunchMeals,
      m.dinnerMeals,
      m.guestMeals,
      m.totalMeals,
      m.bazarCostShare,
      m.utilityShare,
      m.totalCost,
      m.totalDeposited,
      m.netBalance,
    ]),
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Monthly Overview");

  // Sheet 2: Bazar Expenses Breakdown
  const bazarRows = [
    ["BAZAR EXPENSE LOGS", monthYear],
    ["Date", "Description", "Amount (BDT)", "Paid By"],
    ...bazarCosts.map((b) => [b.date, b.description, b.amount, b.paidByName || b.paidById]),
  ];
  const bazarSheet = XLSX.utils.aoa_to_sheet(bazarRows);
  XLSX.utils.book_append_sheet(workbook, bazarSheet, "Bazar Costs");

  // Sheet 3: Utility & Misc Expenses
  const utilityRows = [
    ["UTILITY & MISC EXPENSE LOGS", monthYear],
    ["Month", "Category", "Title / Item", "Amount (BDT)", "Paid By"],
    ...utilityCosts.map((u) => [u.month, u.category, u.title, u.amount, u.paidByName || u.paidById]),
  ];
  const utilitySheet = XLSX.utils.aoa_to_sheet(utilityRows);
  XLSX.utils.book_append_sheet(workbook, utilitySheet, "Utility Costs");

  // Trigger download
  XLSX.writeFile(workbook, `${messName.replace(/\s+/g, "_")}_Report_${monthYear.replace(/\s+/g, "_")}.xlsx`);
}
