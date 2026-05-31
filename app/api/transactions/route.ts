import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ transactions: [] });

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ transactions });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    user = await prisma.user.create({
      data: { clerkId: userId, email: userId + "@temp.com" },
    });
  }

  const body = await req.json();
  const { amount, type, category, description, date } = body;

  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      amount: parseFloat(amount),
      type,
      category,
      description,
      date: new Date(date),
    },
  });

  return NextResponse.json({ transaction });
}