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
import { generatePremiumSchedules, formatDate } from "@/lib/dateUtils";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const { premiumMethod, startDate, lastPremiumDate } = data;
    const policy = await prisma.policy.create({
      data: {
        ...data,
        userId,
      },
      include: {
        user: { include: { subscriptions: true } }
      }
    });

    if (premiumMethod !== "single") {
      const schedules = generatePremiumSchedules(policy.id, startDate, premiumMethod, lastPremiumDate);
      if (schedules.length > 0) {
        await prisma.premiumSchedule.createMany({ data: schedules });
      }

      const firstUnpaid = schedules.find(s => !s.isPaid);
      const nextDate = firstUnpaid ? firstUnpaid.date : null;

      if (nextDate && policy.user.subscriptions.length > 0) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + 10);

        if (nextDate >= today && nextDate <= targetDate) {
          const payload = JSON.stringify({
            title: "Upcoming Premium!",
            body: `Premium for ${policy.beneficiary} is due within 10 days on ${formatDate(nextDate)}`,
            url: `/dashboard?highlight=${policy.id}`
          });

          for (const sub of policy.user.subscriptions) {
            try {
              await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                payload
              );
            } catch (err: any) {
              if (err.statusCode === 410 || err.statusCode === 404) {
                await prisma.pushSubscription.delete({ where: { id: sub.id } });
              }
            }
          }
        }
      }
    }

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error("Policy creation error:", error);
    return NextResponse.json({ error: "Failed to create policy" }, { status: 500 });
  }
}
