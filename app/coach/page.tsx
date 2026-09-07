"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useRef, useEffect } from "react";

const SUGGESTED_PROMPTS = [
  "Analyze my monthly spending habits 📊",
  "Where am I overspending the most? ⚠️",
  "Give me 3 practical tips to save ₹5,000 this month 💰",
  "Am I on track with my active budgets? 🎯",
];

export default function CoachPage() {
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content:
        "👋 Hello! I am your AI Personal Finance Coach. I have direct access to your real-time transactions and budgets. How can I help you optimize your money today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(textToSend?: string) {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage = { role: "user", content: text };
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: updatedHistory.slice(-6), // Send last 6 turns for context
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Sorry, I couldn't generate advice right now." },
      ]);
    } catch (err) {
      console.error("Coach API call failed:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Unable to reach the AI Coach service. Please check your connection and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleClearChat() {
    setMessages([
      {
        role: "assistant",
        content:
          "Chat reset! Ask me anything about your income, expenses, or financial strategy.",
      },
    ]);
  }

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 flex flex-col p-8 overflow-hidden h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              AI Finance Coach <span>🤖</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Context-aware financial guidance powered by AI, tailored to your exact spending data.
            </p>
          </div>

          <button
            onClick={handleClearChat}
            className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 border border-slate-700/60 px-3.5 py-2 rounded-xl transition"
          >
            Clear History 🧹
          </button>
        </div>

        {/* Suggested Prompt Chips */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 shrink-0">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-1">
            Suggestions:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              className="text-xs bg-slate-800/60 hover:bg-slate-700/80 text-emerald-400 border border-slate-700/60 px-3.5 py-2 rounded-xl whitespace-nowrap transition shadow-sm disabled:opacity-50 shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Window */}
        <div className="flex-1 glass-card border border-slate-800/80 rounded-2xl p-6 overflow-y-auto flex flex-col gap-4 shadow-2xl mb-4 bg-slate-900/60">
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div key={i} className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                    isUser
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  }`}
                >
                  {isUser ? "👤" : "🤖"}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? "bg-emerald-500 text-slate-950 font-medium rounded-tr-none shadow-md shadow-emerald-500/10"
                      : "bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none shadow-md"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0 animate-pulse">
                🤖
              </div>
              <div className="bg-slate-800/90 border border-slate-700/60 px-4 py-3 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                <span>Analyzing your financial data...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="flex gap-3 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask your AI coach (e.g. How can I cut down food expenses?)..."
            className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 shadow-inner"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-7 py-3.5 rounded-2xl text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            Send 🚀
          </button>
        </div>
      </main>
    </div>
  );
}
