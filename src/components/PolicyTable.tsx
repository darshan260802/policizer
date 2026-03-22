"use client";

import { Policy } from "@prisma/client";
import { calculateNextPremiumDate, formatDate } from "@/lib/dateUtils";
import { Trash2, Edit2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function PolicyTable({ policies }: { policies: Policy[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("highlight")) {
        setHighlightId(params.get("highlight"));
        const timer = setTimeout(() => {
          setHighlightId(null);
          // Gently remove param from URL without causing reload
          window.history.replaceState(null, '', window.location.pathname);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this policy?")) return;
    setLoadingId(id);
    await fetch(`/api/policies/${id}`, { method: "DELETE" });
    setLoadingId(null);
    router.refresh();
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingPolicy) return;
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      beneficiary: formData.get("beneficiary") as string,
      premiumMethod: formData.get("premiumMethod") as string,
      startDate: new Date(formData.get("startDate") as string),
      lastPremiumDate: formData.get("lastPremiumDate") ? new Date(formData.get("lastPremiumDate") as string) : null,
      premiumAmount: parseFloat(formData.get("premiumAmount") as string),
      sumAssured: parseFloat(formData.get("sumAssured") as string),
      note: formData.get("note") as string,
    };

    await fetch(`/api/policies/${editingPolicy.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    setIsSaving(false);
    setEditingPolicy(null);
    router.refresh();
  }

  const getNextDate = (policy: Policy) => {
    if (policy.premiumMethod === "single") return "N/A";
    const nextDate = calculateNextPremiumDate(policy.startDate, policy.premiumMethod, policy.lastPremiumDate);
    if (!nextDate) return "COMPLETED";
    return formatDate(nextDate);
  };

  const getBadgeColor = (policy: Policy) => {
    if (policy.premiumMethod === "single") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    const nextDate = calculateNextPremiumDate(policy.startDate, policy.premiumMethod, policy.lastPremiumDate);
    if (!nextDate) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800 animate-pulse";
    } else if (diffDays <= 10) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
    } else if (diffDays <= 30) {
      return "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300 border-lime-200 dark:border-lime-800";
    } else {
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    }
  };

  if (!policies || policies.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
        No policies added yet. You are all set!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800/80">
          <tr>
            <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Beneficiary</th>
            <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Method</th>
            <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Start Date</th>
            <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">End Date</th>
            <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Next Premium</th>
            <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">Sum Assured</th>
            <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">Premium</th>
            <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
          </tr>
        </thead>
        <tbody suppressHydrationWarning className="divide-y divide-slate-200 dark:divide-slate-800">
          {policies.map((policy) => (
            <tr key={policy.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-700 ${highlightId === policy.id ? 'bg-yellow-50 dark:bg-yellow-900/30 outline outline-2 outline-yellow-400 shadow-lg relative z-10' : ''}`}>
              <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-slate-100 font-medium">
                {policy.beneficiary}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 capitalize">
                {policy.premiumMethod.replace("_", " ")}
              </td>
              <td suppressHydrationWarning className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                {formatDate(policy.startDate)}
              </td>
              <td suppressHydrationWarning className="px-6 py-4 whitespace-nowrap">
                {policy.lastPremiumDate ? (
                  <span suppressHydrationWarning className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                    {formatDate(policy.lastPremiumDate)}
                  </span>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </td>
              <td suppressHydrationWarning className="px-6 py-4 whitespace-nowrap">
                {policy.premiumMethod === "single" ? (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-sm ${getBadgeColor(policy)}`}>
                    N/A
                  </span>
                ) : (
                  <span suppressHydrationWarning className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-sm ${getBadgeColor(policy)}`}>
                    {getNextDate(policy)}
                  </span>
                )}
              </td>
              <td suppressHydrationWarning className="px-6 py-4 whitespace-nowrap text-right font-medium text-slate-700 dark:text-slate-300">
                ${policy.sumAssured.toLocaleString()}
              </td>
              <td suppressHydrationWarning className="px-6 py-4 whitespace-nowrap text-right font-bold text-blue-600 dark:text-blue-400">
                ${policy.premiumAmount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => setEditingPolicy(policy)} className="text-slate-400 hover:text-blue-600 mr-4 transition-colors" title="Edit">
                  <Edit2 className="w-4 h-4 inline" />
                </button>
                <button onClick={() => handleDelete(policy.id)} disabled={loadingId === policy.id} className="text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50" title="Delete">
                  {loadingId === policy.id ? <Loader2 className="w-4 h-4 inline animate-spin" /> : <Trash2 className="w-4 h-4 inline" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Edit Policy</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Beneficiary Name</label>
                <input required name="beneficiary" defaultValue={editingPolicy.beneficiary} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Method</label>
                  <select required name="premiumMethod" defaultValue={editingPolicy.premiumMethod} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100">
                    <option value="single">Single</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half_yearly">Half Yearly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Premium Amount</label>
                  <input required type="number" step="0.01" name="premiumAmount" defaultValue={editingPolicy.premiumAmount} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input required type="date" name="startDate" defaultValue={new Date(editingPolicy.startDate).toISOString().split('T')[0]} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input type="date" name="lastPremiumDate" defaultValue={editingPolicy.lastPremiumDate ? new Date(editingPolicy.lastPremiumDate).toISOString().split('T')[0] : ''} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sum Assured</label>
                <input required type="number" step="0.01" name="sumAssured" defaultValue={editingPolicy.sumAssured} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingPolicy(null)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
