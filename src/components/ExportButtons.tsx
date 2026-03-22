"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Policy } from "@prisma/client";
import { calculateNextPremiumDate, formatDate } from "@/lib/dateUtils";

export function ExportButtons({ policies }: { policies: Policy[] }) {
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(policies.map(p => {
      const nextDate = calculateNextPremiumDate(p.startDate, p.premiumMethod, p.lastPremiumDate);
      return {
        Beneficiary: p.beneficiary,
        "Premium Method": p.premiumMethod,
        "Start Date": formatDate(p.startDate),
        "End Date": formatDate(p.lastPremiumDate),
        "Next Premium": nextDate ? formatDate(nextDate) : "COMPLETED",
        "Premium Amount": p.premiumAmount,
        "Sum Assured": p.sumAssured,
        "Note": p.note || "-",
      };
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Policies");
    XLSX.writeFile(wb, "policies.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Beneficiary", "Method", "Start Date", "End Date", "Next Premium", "Amount"]],
      body: policies.map((p) => {
        const nextDate = calculateNextPremiumDate(p.startDate, p.premiumMethod, p.lastPremiumDate);
        return [
          p.beneficiary,
          p.premiumMethod,
          formatDate(p.startDate),
          formatDate(p.lastPremiumDate),
          nextDate ? formatDate(nextDate) : "COMPLETED",
          `$${p.premiumAmount}`,
        ];
      }),
    });
    doc.save("policies.pdf");
  };

  return (
    <div className="flex gap-3">
      <button onClick={exportExcel} className="flex flex-1 md:flex-none items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md shadow-emerald-500/20 font-medium transition-colors text-sm active:scale-95">
        <Download className="w-4 h-4 mr-2" /> Excel
      </button>
      <button onClick={exportPDF} className="flex flex-1 md:flex-none items-center justify-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md shadow-rose-500/20 font-medium transition-colors text-sm active:scale-95">
        <Download className="w-4 h-4 mr-2" /> PDF
      </button>
    </div>
  );
}
