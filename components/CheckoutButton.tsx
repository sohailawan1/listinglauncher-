"use client";

import { useState } from "react";

async function createCheckout(plan: "free" | "pro"): Promise<string | null> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? "Could not start checkout.");
  }
  return data.url;
}

export function CheckoutButton({ plan, label }: { plan: "free" | "pro"; label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (plan === "free") {
    return (
      <a
        href="/generate"
        className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100"
      >
        {label}
      </a>
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const url = await createCheckout("pro");
      if (!url) return;
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Redirecting…" : label}
      </button>
      {error ? (
        <p className="mt-3 text-xs text-red-600">{error}</p>
      ) : (
        <p className="mt-3 text-center text-xs text-stone-400">
          Cancel anytime. 30-day money-back guarantee.
        </p>
      )}
    </div>
  );
}