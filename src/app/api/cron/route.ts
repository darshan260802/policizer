import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import webpush from "@/lib/webpush";

export async function GET() {
  try {
    const policies = await prisma.policy.findMany({
      include: { user: { include: { subscriptions: true } } }
    });

    const today = new Date();
    // Start of today to avoid time offsets missing notifications
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + 10);

    const pushed = [];

    for (const policy of policies) {
      if (!policy.user.subscriptions.length) continue;

      let nextDate = new Date(policy.lastPremiumDate || policy.startDate);
      switch (policy.premiumMethod) {
        case "monthly": nextDate.setMonth(nextDate.getMonth() + 1); break;
        case "quarterly": nextDate.setMonth(nextDate.getMonth() + 3); break;
        case "half_yearly": nextDate.setMonth(nextDate.getMonth() + 6); break;
        case "yearly": nextDate.setFullYear(nextDate.getFullYear() + 1); break;
        case "single": continue;
      }

      nextDate.setHours(0, 0, 0, 0);

      if (nextDate >= today && nextDate <= targetDate) {
        const payload = JSON.stringify({
          title: "Premium Reminder",
          body: `Premium for ${policy.beneficiary} is due on ${nextDate.toLocaleDateString()}`,
          url: "/dashboard"
        });

        for (const sub of policy.user.subscriptions) {
          try {
            await webpush.sendNotification({
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth }
            }, payload);
            pushed.push(policy.id);
          } catch (err: any) {
            if (err.statusCode === 410) {
              await prisma.pushSubscription.delete({ where: { id: sub.id } });
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, notifiedCount: pushed.length });
  } catch (error) {
    console.error("Cron error", error);
    return NextResponse.json({ error: "Failed to run cron" }, { status: 500 });
  }
}
