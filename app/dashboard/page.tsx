"use client";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useEffect, useState } from "react";

const CATEGORY_ICONS: Record<string, string> = {
  food: "🍔",
  rent: "🏠",
  transport: "🚗",
  subscriptions: "📺",
  health: "🏥",
  entertainment: "🍿",
  shopping: "🛒",
  utilities: "⚡",
  salary: "💼",
  freelance: "💻",
  other: "📦",
};

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [txRes, budgetRes] = await Promise.all([
          fetch("/api/transactions"),
          fetch("/api/budgets"),
        ]);
        const txData = await txRes.json();
        const budgetData = await budgetRes.json();
        setTransactions(txData.transactions || []);
        setBudgets(budgetData.budgets || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const savingsRate = totalIncome > 0
    ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
    : 0;

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Financial Dashboard <span>📊</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time overview of your income, spending habits, and active budget goals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/transactions"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 text-sm transition-all duration-200 flex items-center gap-2"
            >
              <span>+</span> New Transaction
            </Link>
            <Link
              href="/coach"
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700/80 font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-2"
            >
              <span>🤖</span> Ask AI Coach
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading financial stats...</span>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {/* Net Balance */}
              <div className="glass-card rounded-2xl p-5 border border-slate-800/80 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform">💎</div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Balance</p>
                <p className={`text-3xl font-black mt-2 tracking-tight ${netBalance >= 0 ? "text-white" : "text-rose-400"}`}>
                  ₹{netBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <span>{netBalance >= 0 ? "📈 Positive cash flow" : "⚠️ Expenses exceed income"}</span>
                </p>
              </div>

              {/* Total Income */}
              <div className="glass-card rounded-2xl p-5 border border-emerald-500/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform">💰</div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Total Income</p>
                <p className="text-3xl font-black mt-2 tracking-tight text-emerald-400">
                  +₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-400 mt-2">Earned across all streams</p>
              </div>

              {/* Total Expenses */}
              <div className="glass-card rounded-2xl p-5 border border-rose-500/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform">💳</div>
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">Total Expenses</p>
                <p className="text-3xl font-black mt-2 tracking-tight text-rose-400">
                  -₹{totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-400 mt-2">Spent across all categories</p>
              </div>

              {/* Savings Rate */}
              <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform">🎯</div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Savings Rate</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className={`text-3xl font-black tracking-tight ${savingsRate >= 20 ? "text-indigo-400" : savingsRate > 0 ? "text-amber-400" : "text-rose-400"}`}>
                    {savingsRate}%
                  </p>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${savingsRate >= 20 ? "bg-indigo-500" : savingsRate > 0 ? "bg-amber-500" : "bg-rose-500"}`}
                    style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quick Actions & AI Coach Banner */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                  🤖
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Need personal financial tips?</h3>
                  <p className="text-sm text-slate-300 mt-0.5">
                    Your AI Coach has analyzed your transactions and is ready with personalized advice.
                  </p>
                </div>
              </div>
              <Link
                href="/coach"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 text-sm transition-all whitespace-nowrap"
              >
                Chat with AI Coach →
              </Link>
            </div>

            {/* Content Split: Budgets & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Budget Overview */}
              <div className="glass-card rounded-2xl p-6 border border-slate-800/80 shadow-xl flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>🎯</span> Budget Limits
                  </h2>
                  <Link href="/budgets" className="text-xs text-emerald-400 hover:underline font-medium">
                    Manage Budgets →
                  </Link>
                </div>

                {budgets.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                    <span className="text-3xl mb-2">🏷️</span>
                    <p className="text-sm font-medium text-slate-300">No monthly budgets set yet</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Set spending caps to stay on track</p>
                    <Link href="/budgets" className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl transition">
                      Set Budget Goal
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {budgets.slice(0, 4).map((budget) => {
                      const spent = budget.spent || 0;
                      const percent = Math.min(Math.round((spent / budget.limitAmount) * 100), 100);
                      const isOver = spent >= budget.limitAmount;
                      const isWarning = !isOver && percent >= 80;

                      return (
                        <div key={budget.id} className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-800/60">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <div className="flex items-center gap-2">
                              <span>{CATEGORY_ICONS[budget.category.toLowerCase()] || "📦"}</span>
                              <span className="font-semibold capitalize text-slate-200">{budget.category}</span>
                            </div>
                            <div className="text-xs font-mono">
                              <span className={isOver ? "text-rose-400 font-bold" : "text-slate-300"}>
                                ₹{spent.toLocaleString()}
                              </span>
                              <span className="text-slate-500"> / ₹{budget.limitAmount.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isOver ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center text-[11px] mt-1.5 text-slate-400">
                            <span>{percent}% used</span>
                            <span className={isOver ? "text-rose-400 font-semibold" : isWarning ? "text-amber-400 font-semibold" : "text-emerald-400 font-semibold"}>
                              {isOver ? "Over Limit!" : isWarning ? "Near Limit" : "On Track"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Transactions */}
              <div className="glass-card rounded-2xl p-6 border border-slate-800/80 shadow-xl flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>💳</span> Recent Activity
                  </h2>
                  <Link href="/transactions" className="text-xs text-emerald-400 hover:underline font-medium">
                    View All →
                  </Link>
                </div>

                {recentTransactions.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                    <span className="text-3xl mb-2">💸</span>
                    <p className="text-sm font-medium text-slate-300">No transactions recorded</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Start by recording an income or expense</p>
                    <Link href="/transactions" className="text-xs bg-emerald-500 text-slate-950 font-semibold px-3.5 py-2 rounded-xl transition">
                      + Add Transaction
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {recentTransactions.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-800/50 hover:bg-slate-800/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                            t.type === "income" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {CATEGORY_ICONS[t.category.toLowerCase()] || "📦"}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-200 capitalize">
                              {t.description || t.category}
                            </p>
                            <p className="text-xs text-slate-400 capitalize">
                              {t.category} • {new Date(t.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                            </p>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <p className={`font-bold text-sm ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                            {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}