import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generatePremiumSchedules } from "@/lib/dateUtils";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.policy.deleteMany({
      where: { id, userId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const data = await req.json();

    const updated = await prisma.policy.update({
      where: { id, userId },
      data,
    });

    if (data.premiumMethod !== "single") {
      await prisma.premiumSchedule.deleteMany({ where: { policyId: id } }); 
      const schedules = generatePremiumSchedules(updated.id, updated.startDate, updated.premiumMethod, updated.lastPremiumDate, updated.lastPaidDate);
      if (schedules.length > 0) {
        await prisma.premiumSchedule.createMany({ data: schedules });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
