import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { PolicyTable } from "@/components/PolicyTable";
import { PolicyForm } from "@/components/PolicyForm";
import { ExportButtons } from "@/components/ExportButtons";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { Shield } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const policies = await prisma.policy.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shadow-inner">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-bold text-xl tracking-tight">Policizer</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                Welcome, <span className="font-semibold text-slate-900 dark:text-white">{session.user.name || session.user.email}</span>
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Dashboard</h1>
            <p className="text-slate-500 mt-1 dark:text-slate-400">Manage all your premiums and set reminders.</p>
          </div>
          <PushNotificationManager />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center bg-transparent">
               <h2 className="text-xl font-semibold">Active Policies <span className="text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-0.5 rounded-full ml-2">{policies.length}</span></h2>
               {policies.length > 0 && <ExportButtons policies={policies} />}
            </div>
            <PolicyTable policies={policies} />
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <PolicyForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
