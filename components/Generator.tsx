"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { GeneratedListing, ListingInput, Marketplace, Tone } from "@/lib/types";
import { DEFAULT_LISTING_INPUT } from "@/lib/prompt";
import { isProUsage, recordGeneration, remainingCredits, setProPlan, useUsage } from "@/lib/usage";
import { addToLibrary } from "@/lib/library";
import { ListingDisplay, Spinner } from "@/components/ListingUI";

const MARKETPLACES: { value: Marketplace; label: string; hint: string }[] = [
  { value: "etsy", label: "Etsy", hint: "13 tags · 140-char titles" },
  { value: "amazon", label: "Amazon", hint: "Search-optimized bullets" },
  { value: "shopify", label: "Shopify", hint: "Brand storytelling" },
  { value: "ebay", label: "eBay", hint: "80-char keyword titles" },
  { value: "other", label: "Other", hint: "Marketplace-agnostic" },
];

const TONES: { value: Tone; label: string; emoji: string }[] = [
  { value: "friendly", label: "Friendly", emoji: "😊" },
  { value: "luxury", label: "Luxury", emoji: "✨" },
  { value: "playful", label: "Playful", emoji: "🎉" },
  { value: "minimal", label: "Minimal", emoji: "🕊️" },
  { value: "urgent", label: "Urgent", emoji: "🔥" },
];

const fieldClasses =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm transition-all placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

const labelClasses = "mb-1.5 block text-sm font-medium text-ink-700";

export function Generator() {
  const usage = useUsage();
  const isPro = isProUsage(usage);
  const creditsLeft = remainingCredits(usage);

  const [input, setInput] = useState<ListingInput>(DEFAULT_LISTING_INPUT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<GeneratedListing | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("upgraded") === "1") {
      setProPlan();
      const url = new URL(window.location.href);
      url.searchParams.delete("upgraded");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const set = (key: keyof ListingInput) => (value: string | Marketplace | Tone) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  async function generate() {
    if (!input.productName.trim()) {
      setError("Enter a product name to get started.");
      return;
    }
    if (!isPro && creditsLeft <= 0) {
      setError("You have used all your free listings this month. Upgrade to Pro for unlimited.");
      return;
    }

    setLoading(true);
    setError(null);
    setListing(null);
    setSaved(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = (await res.json()) as {
        listing?: GeneratedListing | null;
        error?: string;
      };

      if (!res.ok || !data.listing) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (!isPro) recordGeneration();

      setListing(data.listing);
      addToLibrary({
        productName: input.productName,
        marketplace: input.marketplace,
        tone: input.tone,
        listing: data.listing,
      });
      setSaved(true);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[440px_1fr]">
      {/* ---------- Left: form ---------- */}
      <div className="space-y-5 self-start rounded-3xl border border-ink-200/80 bg-white p-6 shadow-lg shadow-ink-900/5 lg:sticky lg:top-24">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">New listing</h2>
          {isPro ? (
            <span className="rounded-full bg-gradient-to-r from-purple-100 to-brand-100 px-3 py-1 text-xs font-semibold text-purple-700 ring-1 ring-purple-200">
              ∞ Pro
            </span>
          ) : (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
              {creditsLeft} free left
            </span>
          )}
        </div>

        <div>
          <label htmlFor="productName" className={labelClasses}>
            Product name <span className="text-brand-600">*</span>
          </label>
          <input
            id="productName"
            className={fieldClasses}
            value={input.productName}
            onChange={(e) => set("productName")(e.target.value)}
            placeholder="Hand-poured soy wax candle, lavender"
            disabled={loading}
          />
        </div>

        <div>
          <span className={labelClasses}>Marketplace</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MARKETPLACES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => set("marketplace")(m.value)}
                disabled={loading}
                className={`rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                  input.marketplace === m.value
                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                    : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50"
                }`}
              >
                <span className="block text-sm font-semibold text-ink-900">{m.label}</span>
                <span className="block text-[11px] text-ink-400">{m.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className={labelClasses}>Tone</span>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set("tone")(t.value)}
                disabled={loading}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                  input.tone === t.value
                    ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20"
                    : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="audience" className={labelClasses}>
            Target audience
          </label>
          <input
            id="audience"
            className={fieldClasses}
            value={input.audience}
            onChange={(e) => set("audience")(e.target.value)}
            placeholder="Brides, new parents, busy professionals…"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="details" className={labelClasses}>
            What makes it special?
          </label>
          <textarea
            id="details"
            className={`${fieldClasses} min-h-28 resize-y`}
            value={input.details}
            onChange={(e) => set("details")(e.target.value)}
            placeholder="Materials, size, handcrafted details, story, what problem it solves…"
            disabled={loading}
          />
        </div>

        {error ? (
          <div className="animate-scale-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <Spinner className="h-4 w-4" />
              Writing your listing…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Generate listing
            </>
          )}
        </button>

        {!loading && !listing && !error ? (
          <p className="text-center text-xs text-ink-400">
            Takes ~10 seconds · Saved to your library automatically
          </p>
        ) : null}
      </div>

      {/* ---------- Right: results ---------- */}
      <div className="min-h-[480px] space-y-4">
        {!listing && !loading ? <EmptyState hasError={!!error} /> : null}

        {loading ? (
          <div className="flex min-h-[480px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-ink-300 bg-white/60">
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-brand-400/30 animate-[pulse-ring_1.8s_ease-out_infinite]" />
              <Spinner className="relative h-8 w-8 text-brand-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-ink-900">Crafting a high-converting listing…</p>
              <p className="mt-1 text-xs text-ink-400">
                Analyzing keywords · Writing title · Optimizing tags
              </p>
            </div>
          </div>
        ) : null}

        {listing ? (
          <>
            {saved ? (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-xs text-green-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved to your <Link href="/library" className="font-semibold underline">library</Link>
              </div>
            ) : null}

            <ListingDisplay listing={listing} />

            {!isPro ? (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-brand-50 p-5">
                <div>
                  <p className="text-sm font-semibold text-purple-900">
                    {creditsLeft > 0 ? "Enjoying it?" : "Out of free listings"}
                  </p>
                  <p className="mt-0.5 text-xs text-purple-700">
                    {creditsLeft > 0
                      ? `You have ${creditsLeft} free listing${creditsLeft === 1 ? "" : "s"} left this month.`
                      : "Upgrade to Pro for unlimited AI listings."}
                  </p>
                </div>
                <Link
                  href="/#pricing"
                  className="shrink-0 rounded-full bg-purple-700 px-4 py-2 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-800"
                >
                  Go Pro
                </Link>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ hasError }: { hasError?: boolean }) {
  return (
    <div className="relative flex min-h-[480px] flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-dashed border-ink-300 bg-white/60 p-10 text-center">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-40" />
      <p className="relative text-4xl">✦</p>
      <div className="relative">
        <p className="text-lg font-semibold text-ink-900">
          {hasError ? "Ready when you are" : "Your listing appears here"}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">
          Fill in your product details and hit “Generate listing”. You will get a
          title, description, key benefits, tags, and keywords in seconds.
        </p>
      </div>
    </div>
  );
}
