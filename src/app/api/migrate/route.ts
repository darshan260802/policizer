import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generatePremiumSchedules } from "@/lib/dateUtils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.premiumSchedule.deleteMany();
    const policies = await prisma.policy.findMany();
    
    let count = 0;
    for (const p of policies) {
      if (p.premiumMethod === "single") continue;
      const schedules = generatePremiumSchedules(p.id, p.startDate, p.premiumMethod, p.lastPremiumDate, (p as any).lastPaidDate);
      if (schedules.length > 0) {
        await prisma.premiumSchedule.createMany({ data: schedules });
        count += schedules.length;
      }
    }
    return NextResponse.json({ success: true, count });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
