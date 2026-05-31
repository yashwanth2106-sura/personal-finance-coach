"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const CATEGORIES = ["food", "rent", "transport", "subscriptions", "health", "entertainment", "shopping", "utilities"];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "food", limitAmount: "" });

  useEffect(() => { fetchBudgets(); }, []);

  async function fetchBudgets() {
    const res = await fetch("/api/budgets");
    const data = await res.json();
    setBudgets(data.budgets || []);
  }

  async function handleSave() {
    if (!form.limitAmount) return;
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ category: "food", limitAmount: "" });
    setShowForm(false);
    fetchBudgets();
  }

  async function handleDelete(id: string) {
    await fetch("/api/budgets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchBudgets();
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col gap-2">
        <h2 className="text-xl font-bold mb-6">💰 Finance Coach</h2>
        <Link href="/dashboard" className="px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition">📊 Dashboard</Link>
        <Link href="/transactions" className="px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition">💳 Transactions</Link>
        <Link href="/budgets" className="px-4 py-2 rounded-lg bg-gray-800 text-white">🎯 Budgets</Link>
        <Link href="/coach" className="px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition">🤖 AI Coach</Link>
        <div className="mt-auto pt-6 border-t border-gray-800"><UserButton /></div>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Budgets</h1>
          <button onClick={() => setShowForm(!showForm)} className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
            + Add Budget
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">New Budget</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mt-1 text-white">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Monthly Limit (₹)</label>
                <input type="number" value={form.limitAmount} onChange={e => setForm({...form, limitAmount: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mt-1 text-white" placeholder="0.00" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
                Save Budget
              </button>
              <button onClick={() => setShowForm(false)} className="border border-gray-700 px-6 py-2 rounded-lg hover:bg-gray-800 transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {budgets.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
            No budgets yet. Add your first budget goal!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {budgets.map((budget) => {
              const percent = Math.min((0 / budget.limitAmount) * 100, 100);
              const color = percent >= 100 ? "bg-red-500" : percent >= 80 ? "bg-yellow-500" : "bg-green-500";
              return (
                <div key={budget.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold capitalize">{budget.category}</h3>
                    <button onClick={() => handleDelete(budget.id)} className="text-gray-500 hover:text-red-400 text-sm transition">Delete</button>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>₹0 spent</span>
                    <span>₹{budget.limitAmount} limit</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${percent}%` }}></div>
                  </div>
                  <p className="text-sm mt-2 text-green-400">✅ On track</p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}