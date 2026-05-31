"use client";
import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function CoachPage() {
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "Hi! I'm your personal finance coach 👋 Ask me anything about your finances!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't connect. Please try again!" }]);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col gap-2">
        <h2 className="text-xl font-bold mb-6">💰 Finance Coach</h2>
        <Link href="/dashboard" className="px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition">📊 Dashboard</Link>
        <Link href="/transactions" className="px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition">💳 Transactions</Link>
        <Link href="/budgets" className="px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition">🎯 Budgets</Link>
        <Link href="/coach" className="px-4 py-2 rounded-lg bg-gray-800 text-white">🤖 AI Coach</Link>
        <div className="mt-auto pt-6 border-t border-gray-800"><UserButton  /></div>
      </aside>

      <main className="flex-1 flex flex-col p-8">
        <h1 className="text-3xl font-bold mb-8">AI Finance Coach</h1>

        {/* Chat Window */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4 overflow-y-auto max-h-[500px] flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] px-4 py-3 rounded-xl text-sm ${
                msg.role === "user"
                  ? "bg-white text-black"
                  : "bg-gray-800 text-gray-100"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 px-4 py-3 rounded-xl text-sm text-gray-400">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask me about your finances..."
            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
