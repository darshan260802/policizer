import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import webpush from "@/lib/webpush";

export async function POST(req: Request) {
  try {
    const { userId, title, body, url } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "UserId required" }, { status: 400 });
    }

    const subs = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subs.length === 0) {
      return NextResponse.json({ message: "No subscriptions found" });
    }

    const payload = JSON.stringify({ title, body, url });
    
    const sendPromises = subs.map((sub: any) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };
      return webpush.sendNotification(pushSubscription, payload).catch((err: any) => {
        if (err.statusCode === 410) {
          return prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
        console.error("Push error", err);
      });
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ message: "Push sent" });
  } catch (error) {
    console.error("Send push error", error);
    return NextResponse.json({ error: "Failed to send push" }, { status: 500 });
  }
}
