import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Personal Finance Coach
        </h1>
        <p className="text-xl text-gray-400">
          Track your spending, set budgets, and get AI-powered financial advice — all in one place.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/sign-up"
            className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}