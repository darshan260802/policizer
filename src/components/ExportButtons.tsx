"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Policy } from "@prisma/client";

export function ExportButtons({ policies }: { policies: Policy[] }) {
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(policies.map(p => ({
      Beneficiary: p.beneficiary,
      "Premium Method": p.premiumMethod,
      "Start Date": new Date(p.startDate).toLocaleDateString(),
      "Last Premium": p.lastPremiumDate ? new Date(p.lastPremiumDate).toLocaleDateString() : "-",
      "Premium Amount": p.premiumAmount,
      "Sum Assured": p.sumAssured,
      "Note": p.note || "-",
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Policies");
    XLSX.writeFile(wb, "policies.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Beneficiary", "Method", "Start Date", "Last Premium", "Premium", "Sum Assured"]],
      body: policies.map((p) => [
        p.beneficiary,
        p.premiumMethod,
        new Date(p.startDate).toLocaleDateString(),
        p.lastPremiumDate ? new Date(p.lastPremiumDate).toLocaleDateString() : "-",
        `$${p.premiumAmount}`,
        `$${p.sumAssured}`,
      ]),
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
