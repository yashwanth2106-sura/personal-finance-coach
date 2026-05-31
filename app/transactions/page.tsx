"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const CATEGORIES = ["food", "rent", "transport", "subscriptions", "health", "entertainment", "shopping", "utilities", "salary", "freelance", "other"];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: "", type: "expense", category: "food", description: "", date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => { fetchTransactions(); }, []);

  async function fetchTransactions() {
    const res = await fetch("/api/transactions");
    const data = await res.json();
    setTransactions(data.transactions || []);
  }

  async function handleSubmit() {
    setLoading(true);
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ amount: "", type: "expense", category: "food", description: "", date: new Date().toISOString().split("T")[0] });
    setShowForm(false);
    setLoading(false);
    fetchTransactions();
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col gap-2">
        <h2 className="text-xl font-bold mb-6">💰 Finance Coach</h2>
        <Link href="/dashboard" className="px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition">📊 Dashboard</Link>
        <Link href="/transactions" className="px-4 py-2 rounded-lg bg-gray-800 text-white">💳 Transactions</Link>
        <Link href="/budgets" className="px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition">🎯 Budgets</Link>
        <Link href="/coach" className="px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition">🤖 AI Coach</Link>
        <div className="mt-auto pt-6 border-t border-gray-800"><UserButton  /></div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <button onClick={() => setShowForm(!showForm)} className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
            + Add Transaction
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">New Transaction</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Amount (₹)</label>
                <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mt-1 text-white" placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm text-gray-400">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mt-1 text-white">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mt-1 text-white">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Date</label>
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mt-1 text-white" />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400">Description (optional)</label>
                <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mt-1 text-white" placeholder="e.g. Lunch at restaurant" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSubmit} disabled={loading || !form.amount}
                className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50">
                {loading ? "Saving..." : "Save Transaction"}
              </button>
              <button onClick={() => setShowForm(false)} className="border border-gray-700 px-6 py-2 rounded-lg hover:bg-gray-800 transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-center p-8">No transactions yet. Add your first one!</p>
          ) : (
            <table className="w-full">
              <thead className="border-b border-gray-800">
                <tr className="text-left text-gray-400 text-sm">
                  <th className="p-4">Date</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any) => (
                  <tr key={t.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                    <td className="p-4 text-gray-400 text-sm">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="p-4">{t.description || "-"}</td>
                    <td className="p-4"><span className="bg-gray-800 px-2 py-1 rounded text-sm">{t.category}</span></td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-sm ${t.type === "income" ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>{t.type}</span></td>
                    <td className={`p-4 text-right font-medium ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                      {t.type === "income" ? "+" : "-"}₹{t.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
