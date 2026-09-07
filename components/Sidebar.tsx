"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Transactions", href: "/transactions", icon: "💳" },
    { name: "Budgets", href: "/budgets", icon: "🎯" },
    { name: "AI Coach", href: "/coach", icon: "🤖" },
  ];

  return (
    <aside className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/60 p-6 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20">
            💰
          </div>
          <div>
            <h2 className="font-bold text-lg text-white tracking-tight">Finance AI</h2>
            <p className="text-xs text-emerald-400 font-medium">Smart Money Manager</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-950/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile */}
      <div className="pt-6 border-t border-slate-800/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800/80">
          <div className="flex items-center gap-3">
            <UserButton />
            <div className="text-xs">
              <p className="font-semibold text-slate-200">My Account</p>
              <p className="text-slate-400 text-[10px]">Logged In</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}