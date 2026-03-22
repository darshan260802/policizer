import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const policies = await prisma.policy.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(policies);
}

import webpush from "@/lib/webpush";
import { calculateNextPremiumDate, formatDate } from "@/lib/dateUtils";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const policy = await prisma.policy.create({
      data: {
        ...data,
        userId,
      },
      include: {
        user: { include: { subscriptions: true } }
      }
    });

    if (policy.premiumMethod !== "single" && policy.user.subscriptions.length > 0) {
      const nextDate = calculateNextPremiumDate(policy.startDate, policy.premiumMethod, policy.lastPremiumDate);
      
      const today = new Date();
      today.setHours(0,0,0,0);
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + 10);

      if (nextDate && nextDate >= today && nextDate <= targetDate) {
        const payload = JSON.stringify({
          title: "Upcoming Premium!",
          body: `Premium for ${policy.beneficiary} is due within 10 days on ${formatDate(nextDate)}`,
          url: "/dashboard"
        });

        for (const sub of policy.user.subscriptions) {
          try {
            await webpush.sendNotification({
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth }
            }, payload);
          } catch (err) {}
        }
      }
    }

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error("Policy creation error:", error);
    return NextResponse.json({ error: "Failed to create policy" }, { status: 500 });
  }
}
