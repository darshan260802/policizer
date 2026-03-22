"use client";

import { Policy } from "@prisma/client";

export function PolicyTable({ policies }: { policies: Policy[] }) {
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
            <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Last Premium</th>
            <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">Premium</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {policies.map((policy) => (
            <tr key={policy.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-slate-100 font-medium">
                {policy.beneficiary}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 capitalize">
                {policy.premiumMethod.replace("_", " ")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                {new Date(policy.startDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {policy.lastPremiumDate ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {new Date(policy.lastPremiumDate).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-slate-900 dark:text-slate-100">
                ${policy.premiumAmount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
