import jsPDF from "jspdf";
import { MemberSummary } from "./types";

export function exportMonthlyReportToPDF(
  monthYear: string,
  messName: string,
  totalBazarCost: number,
  totalMeals: number,
  mealRate: number,
  totalUtilityCost: number,
  memberSummaries: MemberSummary[]
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text(messName, 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(`Monthly Financial Statement & Meal Rate Report — ${monthYear}`, 14, 28);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 34);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 38, 196, 38);

  // Key Metrics Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, 182, 32, 3, 3, "F");

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL BAZAR COST", 20, 50);
  doc.text("TOTAL MEALS", 70, 50);
  doc.text("MEAL RATE", 115, 50);
  doc.text("TOTAL UTILITY", 155, 50);

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`৳${totalBazarCost.toLocaleString()}`, 20, 62);
  doc.text(`${totalMeals}`, 70, 62);
  doc.text(`৳${mealRate.toFixed(2)}`, 115, 62);
  doc.text(`৳${totalUtilityCost.toLocaleString()}`, 155, 62);

  // Table Headers
  let startY = 86;
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("Member Name", 14, startY);
  doc.text("Meals", 70, startY);
  doc.text("Bazar Cost", 95, startY);
  doc.text("Utility Share", 125, startY);
  doc.text("Deposits", 155, startY);
  doc.text("Net Balance", 178, startY);

  doc.line(14, startY + 2, 196, startY + 2);
  startY += 10;

  // Table Rows
  doc.setFontSize(9);
  memberSummaries.forEach((m) => {
    if (startY > 270) {
      doc.addPage();
      startY = 20;
    }
    doc.setTextColor(30, 41, 59);
    doc.text(m.user.name.substring(0, 25), 14, startY);
    doc.text(`${m.totalMeals}`, 70, startY);
    doc.text(`৳${m.bazarCostShare.toFixed(1)}`, 95, startY);
    doc.text(`৳${m.utilityShare.toFixed(1)}`, 125, startY);
    doc.text(`৳${m.totalDeposited}`, 155, startY);

    if (m.netBalance >= 0) {
      doc.setTextColor(16, 185, 129); // Green surplus
      doc.text(`+৳${m.netBalance.toFixed(1)}`, 178, startY);
    } else {
      doc.setTextColor(239, 68, 68); // Red due
      doc.text(`-৳${Math.abs(m.netBalance).toFixed(1)}`, 178, startY);
    }

    startY += 8;
  });

  // Footer / Signature block
  if (startY > 250) {
    doc.addPage();
    startY = 30;
  } else {
    startY += 20;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(14, startY, 70, startY);
  doc.line(140, startY, 196, startY);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("Mess Manager Signature", 14, startY + 6);
  doc.text("Audited & Approved By", 140, startY + 6);

  doc.save(`${messName.replace(/\s+/g, "_")}_Statement_${monthYear.replace(/\s+/g, "_")}.pdf`);
}
