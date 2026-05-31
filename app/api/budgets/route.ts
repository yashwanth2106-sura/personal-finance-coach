import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ budgets: [] });

    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: { clerkId: userId, email: userId + "@temp.com" },
      });
    }

    const budgets = await prisma.budget.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ budgets: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: { clerkId: userId, email: userId + "@temp.com" },
      });
    }

    const { category, limitAmount } = await req.json();
    const now = new Date();

    const budget = await prisma.budget.create({
      data: {
        userId: user.id,
        category,
        limitAmount: parseFloat(limitAmount),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });

    return NextResponse.json({ budget });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    await prisma.budget.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 });
  }
}