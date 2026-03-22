"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function PolicyForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      beneficiary: formData.get("beneficiary"),
      startDate: new Date(formData.get("startDate") as string).toISOString(),
      maturityDate: formData.get("maturityDate") ? new Date(formData.get("maturityDate") as string).toISOString() : null,
      lastPremiumDate: formData.get("lastPremiumDate") ? new Date(formData.get("lastPremiumDate") as string).toISOString() : null,
      premiumMethod: formData.get("premiumMethod"),
      premiumAmount: parseFloat(formData.get("premiumAmount") as string),
      sumAssured: parseFloat(formData.get("sumAssured") as string),
      note: formData.get("note") || null,
    };

    try {
      const res = await fetch("/api/policies", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        (e.target as HTMLFormElement).reset();
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-white border";

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit} 
      className="space-y-4 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"
    >
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Add New Policy</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Beneficiary</label>
          <input required type="text" name="beneficiary" className={inputClass} placeholder="e.g. John Doe" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Premium Method</label>
          <select required name="premiumMethod" className={inputClass}>
            <option value="single">Single</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="half_yearly">Half Yearly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
          <input required type="date" name="startDate" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date (Maturity)</label>
          <input type="date" name="lastPremiumDate" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Maturity Date (Optional)</label>
          <input type="date" name="maturityDate" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Premium Amount</label>
          <input required type="number" step="0.01" name="premiumAmount" className={inputClass} placeholder="e.g. 500" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sum Assured</label>
          <input required type="number" step="0.01" name="sumAssured" className={inputClass} placeholder="e.g. 100000" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Additional Note</label>
          <textarea name="note" rows={3} className={inputClass} placeholder="Any additional details..."></textarea>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center py-2.5 px-6 rounded-full shadow-md shadow-blue-500/20 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all active:scale-95 w-full md:w-auto"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Save Policy
        </button>
      </div>
    </motion.form>
  );
}
