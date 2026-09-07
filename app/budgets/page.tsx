"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";

const CATEGORIES = ["food", "rent", "transport", "subscriptions", "health", "entertainment", "shopping", "utilities", "other"];

const CATEGORY_ICONS: Record<string, string> = {
  food: "🍔",
  rent: "🏠",
  transport: "🚗",
  subscriptions: "📺",
  health: "🏥",
  entertainment: "🍿",
  shopping: "🛒",
  utilities: "⚡",
  other: "📦",
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ category: "food", limitAmount: "" });

  useEffect(() => {
    fetchBudgets();
  }, []);

  async function fetchBudgets() {
    try {
      const res = await fetch("/api/budgets");
      const data = await res.json();
      setBudgets(data.budgets || []);
    } catch (err) {
      console.error("Error fetching budgets:", err);
    }
  }

  async function handleSave() {
    if (!form.limitAmount) return;
    setLoading(true);
    try {
      await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ category: "food", limitAmount: "" });
      setShowForm(false);
      fetchBudgets();
    } catch (err) {
      console.error("Error saving budget:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this budget goal?")) return;
    try {
      await fetch("/api/budgets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchBudgets();
    } catch (err) {
      console.error("Error deleting budget:", err);
    }
  }

  const totalAllocated = budgets.reduce((sum, b) => sum + (b.limitAmount || 0), 0);
  const totalSpentInBudgets = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Monthly Budgets <span>🎯</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Set spending limits per category to prevent overspending and hit your savings goals.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 text-sm transition-all duration-200 flex items-center gap-2"
          >
            <span>{showForm ? "✕ Close Form" : "+ Set Budget Goal"}</span>
          </button>
        </div>

        {/* Budget KPI Cards Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="glass-card rounded-2xl p-5 border border-slate-800/80">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Budget Allocated</p>
            <p className="text-2xl font-black mt-1 text-white font-mono">
              ₹{totalAllocated.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">Sum of all active category caps</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800/80">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Spent this Month</p>
            <p className="text-2xl font-black mt-1 text-emerald-400 font-mono">
              ₹{totalSpentInBudgets.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">In budgeted categories</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800/80">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Budget Health</p>
            <p className="text-2xl font-black mt-1 text-indigo-400 font-mono">
              {totalAllocated > 0 ? Math.round((totalSpentInBudgets / totalAllocated) * 100) : 0}% Used
            </p>
            <p className="text-xs text-slate-500 mt-1">Remaining: ₹{Math.max(0, totalAllocated - totalSpentInBudgets).toLocaleString()}</p>
          </div>
        </div>

        {/* New / Edit Budget Form */}
        {showForm && (
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 mb-8 shadow-2xl bg-slate-900/90 relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🏷️</span> Set Category Limit
              </h2>
              <span className="text-xs text-slate-400">Updates existing budget if already set</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 capitalize"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 capitalize">
                      {CATEGORY_ICONS[c] || "📦"} {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={form.limitAmount}
                  onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 5000"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-slate-700 text-slate-300 hover:bg-slate-800 px-5 py-2 rounded-xl text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || !form.limitAmount}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Budget Goal"}
              </button>
            </div>
          </div>
        )}

        {/* Budgets Grid */}
        {budgets.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center border border-slate-800/80">
            <span className="text-4xl mb-3">🎯</span>
            <h3 className="font-bold text-slate-200 text-base">No monthly budget goals defined</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">Set spend caps to get real-time tracking and warnings.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-emerald-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition"
            >
              + Create First Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map((budget) => {
              const spent = budget.spent || 0;
              const limit = budget.limitAmount || 1;
              const percent = Math.min(Math.round((spent / limit) * 100), 100);
              const remaining = limit - spent;
              const isOver = spent >= limit;
              const isWarning = !isOver && percent >= 80;

              return (
                <div
                  key={budget.id}
                  className="glass-card rounded-2xl p-6 border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-lg flex flex-col justify-between"
                >
                  <div>
                    {/* Card Top */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-2xl shadow-inner">
                          {CATEGORY_ICONS[budget.category.toLowerCase()] || "📦"}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-white capitalize">{budget.category}</h3>
                          <p className="text-xs text-slate-400">Monthly Limit</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                            isOver
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                              : isWarning
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {isOver ? "Over Limit" : isWarning ? "Near Limit" : "On Track"}
                        </span>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                          title="Delete budget"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Spend Stats */}
                    <div className="flex justify-between items-baseline text-sm mb-2 font-mono">
                      <span className="text-slate-400">
                        Spent: <strong className="text-white">₹{spent.toLocaleString()}</strong>
                      </span>
                      <span className="text-slate-400">
                        Cap: <strong className="text-slate-200">₹{limit.toLocaleString()}</strong>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-800/60 text-xs">
                    <span className="text-slate-400 font-mono">{percent}% of limit consumed</span>
                    <span className={`font-mono font-semibold ${remaining < 0 ? "text-rose-400" : "text-slate-300"}`}>
                      {remaining < 0
                        ? `Exceeded by ₹${Math.abs(remaining).toLocaleString()}`
                        : `₹${remaining.toLocaleString()} remaining`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}