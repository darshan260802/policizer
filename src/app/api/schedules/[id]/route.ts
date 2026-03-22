import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { isPaid } = body;

    const schedule = await prisma.premiumSchedule.findUnique({
      where: { id },
      include: { policy: true },
    });

    if (!schedule || schedule.policy.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      const s = await tx.premiumSchedule.update({
        where: { id },
        data: { isPaid },
      });
      await tx.policy.update({
        where: { id: s.policyId },
        data: { lastPaidDate: s.date }
      });
      return s;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Schedule Update format error:", error);
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}
