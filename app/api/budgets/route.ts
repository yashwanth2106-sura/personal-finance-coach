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

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await prisma.budget.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const transactions = await prisma.transaction.findMany({
          where: {
            userId: user!.id,
            category: budget.category,
            type: "expense",
            date: {
              gte: new Date(`${year}-${String(month).padStart(2, "0")}-01`),
              lt: new Date(month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`),
            },
          },
        });
        const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
        return { ...budget, spent };
      })
    );

    return NextResponse.json({ budgets: budgetsWithSpent });
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

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month_year: {
          userId: user.id,
          category,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      },
      update: {
        limitAmount: parseFloat(limitAmount),
      },
      create: {
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
