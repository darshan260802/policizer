import Link from "next/link";
import { Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 min-h-screen px-4">
      <div className="max-w-3xl flex flex-col items-center text-center">
        <div className="w-20 h-20 mb-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shadow-inner shadow-blue-500/20">
          <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl">
          Never Miss a <span className="text-blue-600 dark:text-blue-400 inline-block">Premium.</span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl leading-8 text-slate-600 dark:text-slate-300 max-w-2xl">
          Policizer is your personal insurance companion. Track your policies, analyze your premiums, and get notified on your devices 10 days before any payment is due.
        </p>
        
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/login"
            className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all active:scale-95"
          >
            Get Started Free
          </Link>
          <Link href="/login" className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Sign In <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
