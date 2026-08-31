"use client";

import { useState } from "react";
import type { PlanId } from "@/lib/plans";

async function createCheckout(plan: PlanId): Promise<string | null> {
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

export function CheckoutButton({
  plan,
  label,
  variant = "primary",
}: {
  plan: PlanId;
  label: string;
  variant?: "primary" | "dark" | "outline";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (plan === "free") {
    return (
      <a
        href="/generate"
        className={
          variant === "dark"
            ? "inline-flex w-full items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-700"
            : "inline-flex w-full items-center justify-center rounded-full border border-ink-300 bg-white px-6 py-3 text-sm font-semibold text-ink-800 transition-all hover:-translate-y-0.5 hover:bg-ink-100"
        }
      >
        {label}
      </a>
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const url = await createCheckout(plan);
      if (!url) return;
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  const base =
    variant === "dark"
      ? "bg-ink-900 hover:bg-ink-700"
      : variant === "outline"
        ? "border border-ink-300 bg-white text-ink-800 hover:bg-ink-100"
        : "bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40";

  return (
    <div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${base}`}
      >
        {loading ? "Redirecting…" : label}
      </button>
      {error ? (
        <p className="mt-3 text-xs text-red-600">{error}</p>
      ) : (
        <p className="mt-3 text-center text-xs text-ink-400">
          Cancel anytime. 30-day money-back guarantee.
        </p>
      )}
    </div>
  );
}
