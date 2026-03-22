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
    });
    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error("Policy creation error:", error);
    return NextResponse.json({ error: "Failed to create policy" }, { status: 500 });
  }
}
