"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";

const CATEGORIES = ["food", "rent", "transport", "subscriptions", "health", "entertainment", "shopping", "utilities", "salary", "freelance", "other"];

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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    category: "food",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const res = await fetch("/api/transactions");
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  }

  async function handleSubmit() {
    if (!form.amount) return;
    setLoading(true);
    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({
        amount: "",
        type: "expense",
        category: "food",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      fetchTransactions();
    } catch (err) {
      console.error("Error creating transaction:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await fetch("/api/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchTransactions();
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  }

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || t.type === selectedType;
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Transactions <span>💳</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Track, record, and manage all your income streams and monthly expenses.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 text-sm transition-all duration-200 flex items-center gap-2"
          >
            <span>{showForm ? "✕ Close Form" : "+ Add Transaction"}</span>
          </button>
        </div>

        {/* New Transaction Form Modal / Card */}
        {showForm && (
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 mb-8 shadow-2xl bg-slate-900/90 relative">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📝</span> Record New Transaction
              </h2>
              <span className="text-xs text-slate-400">All fields stored securely</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Type Switch */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "expense" })}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      form.type === "expense"
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    💸 Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "income" })}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      form.type === "income"
                        ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    💰 Income
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>

              {/* Category */}
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

              {/* Date */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Description / Note
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Swiggy order, Monthly salary, Coffee break"
                />
              </div>
            </div>

            {/* Form Actions */}
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
                onClick={handleSubmit}
                disabled={loading || !form.amount}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Transaction"}
              </button>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Search transactions..."
              className="w-full bg-slate-900/90 border border-slate-700/70 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
            {/* Type Selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>

            {/* Category Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 capitalize"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Header */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-2">
          <span>Showing {filteredTransactions.length} transaction(s)</span>
          <div className="flex gap-4 font-mono">
            <span className="text-emerald-400">Income: +₹{totalFilteredIncome.toLocaleString()}</span>
            <span className="text-rose-400">Expense: -₹{totalFilteredExpense.toLocaleString()}</span>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16 text-slate-400 flex flex-col items-center">
              <span className="text-4xl mb-3">🔍</span>
              <p className="font-semibold text-slate-300">No transactions found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or add a new transaction.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Type</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTransactions.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 text-slate-400 text-xs font-mono">
                        {new Date(t.date).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-4 font-medium text-slate-200">
                        {t.description || <span className="text-slate-500 italic">No note</span>}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-lg text-xs font-medium capitalize text-slate-300">
                          <span>{CATEGORY_ICONS[t.category.toLowerCase()] || "📦"}</span>
                          <span>{t.category}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            t.type === "income"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td
                        className={`p-4 text-right font-mono font-bold text-base ${
                          t.type === "income" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                          title="Delete transaction"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
