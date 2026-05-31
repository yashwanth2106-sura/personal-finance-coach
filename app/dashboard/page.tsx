import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col gap-2">
        <h2 className="text-xl font-bold mb-6 text-white">💰 Finance Coach</h2>
        <Link href="/dashboard" className="px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition">
          📊 Dashboard
        </Link>
        <Link href="/transactions" className="px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition">
          💳 Transactions
        </Link>
        <Link href="/budgets" className="px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition">
          🎯 Budgets
        </Link>
        <Link href="/coach" className="px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition">
          🤖 AI Coach
        </Link>
        <div className="mt-auto pt-6 border-t border-gray-800">
          <UserButton  />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400 mb-8">Welcome to your personal finance coach!</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Total Income</p>
            <p className="text-2xl font-bold text-green-400 mt-1">₹0.00</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Total Expenses</p>
            <p className="text-2xl font-bold text-red-400 mt-1">₹0.00</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Savings Rate</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">0%</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-center">No transactions yet. Add your first transaction!</p>
        </div>
      </main>
    </div>
  );
}
