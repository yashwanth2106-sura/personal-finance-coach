import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const { message, history } = await req.json();

    let userContextSummary = "The user has no recorded transactions yet.";

    if (userId) {
      const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (user) {
        const [transactions, budgets] = await Promise.all([
          prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { date: "desc" } }),
          prisma.budget.findMany({ where: { userId: user.id } }),
        ]);

        const totalIncome = transactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        const categoryTotals: Record<string, number> = {};
        transactions
          .filter((t) => t.type === "expense")
          .forEach((t) => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
          });

        const topCategories = Object.entries(categoryTotals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(2)}`)
          .join(", ");

        const budgetStatus = budgets.map((b) => {
          const spent = transactions
            .filter((t) => t.category === b.category && t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);
          return `${b.category}: spent ₹${spent.toFixed(0)} of ₹${b.limitAmount} limit`;
        }).join("; ");

        userContextSummary = `
User Financial Summary:
- Total Income: ₹${totalIncome.toFixed(2)}
- Total Expenses: ₹${totalExpenses.toFixed(2)}
- Net Balance: ₹${(totalIncome - totalExpenses).toFixed(2)}
- Top Expense Categories: ${topCategories || "None"}
- Budget Targets: ${budgetStatus || "No budgets set"}
- Recent Transactions Count: ${transactions.length}
        `.trim();
      }
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ reply: "Groq API key is missing. Please set GROQ_API_KEY in your .env.local file." });
    }

    const client = new Groq({ apiKey: groqKey });

    const systemPrompt = `You are a supportive, knowledgeable personal finance coach built into a financial tracking dashboard.
Give practical, encouraging, and highly tailored financial advice using the user's real financial context provided below. Keep your formatting clean with short paragraphs, bullet points, and bulleted action steps when appropriate.

${userContextSummary}

Respond directly to the user's question with actionable steps.`;

    const formattedMessages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    if (Array.isArray(history)) {
      history.forEach((h: any) => {
        if (h.role === "user" || h.role === "assistant") {
          formattedMessages.push({ role: h.role, content: h.content });
        }
      });
    }

    formattedMessages.push({ role: "user", content: message });

    let reply = "";
    try {
      const response = await client.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 800,
      });
      reply = response.choices[0]?.message?.content || "";
    } catch (err: any) {
      console.warn("Primary model openai/gpt-oss-20b failed, trying fallback qwen/qwen3.6-27b:", err?.message);
      const fallbackResponse = await client.chat.completions.create({
        model: "qwen/qwen3.6-27b",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 800,
      });
      reply = fallbackResponse.choices[0]?.message?.content || "";
    }

    if (!reply) {
      reply = "I'm sorry, I couldn't generate a response at the moment. Please try asking again!";
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("POST /api/coach error:", error);
    return NextResponse.json({ reply: "Sorry, something went wrong while analyzing your finances. Please try again!" });
  }
}