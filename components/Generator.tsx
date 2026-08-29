"use client";

import { useEffect, useState } from "react";
import type { GeneratedListing, ListingInput, Marketplace, Tone } from "@/lib/types";
import { DEFAULT_LISTING_INPUT } from "@/lib/prompt";
import { isProUsage, recordGeneration, remainingCredits, setProPlan, useUsage } from "@/lib/usage";

const MARKETPLACES: { value: Marketplace; label: string }[] = [
  { value: "etsy", label: "Etsy" },
  { value: "amazon", label: "Amazon" },
  { value: "shopify", label: "Shopify" },
  { value: "ebay", label: "eBay" },
  { value: "other", label: "Other" },
];

const TONES: { value: Tone; label: string }[] = [
  { value: "friendly", label: "Friendly" },
  { value: "luxury", label: "Luxury" },
  { value: "playful", label: "Playful" },
  { value: "minimal", label: "Minimal" },
  { value: "urgent", label: "Urgent" },
];

const fieldClasses =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30";

const labelClasses = "mb-1.5 block text-sm font-medium text-stone-700";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-md border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100"
    >
      {copied ? "Copied" : `Copy ${label}`}
    </button>
  );
}

function SectionCard({
  title,
  children,
  extra,
}: {
  title: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
        {extra}
      </div>
      {children}
    </section>
  );
}

export function Generator() {
  const usage = useUsage();
  const isPro = isProUsage(usage);
  const creditsLeft = remainingCredits(usage);

  const [input, setInput] = useState<ListingInput>(DEFAULT_LISTING_INPUT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<GeneratedListing | null>(null);

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
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 sm:px-6 lg:grid-cols-[420px_1fr]">
      <div className="space-y-4 self-start rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">New listing</h2>
          {isPro ? (
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              Pro
            </span>
          ) : (
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
              {creditsLeft} free left
            </span>
          )}
        </div>

        <div>
          <label htmlFor="productName" className={labelClasses}>
            Product name *
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="marketplace" className={labelClasses}>
              Marketplace
            </label>
            <select
              id="marketplace"
              className={fieldClasses}
              value={input.marketplace}
              onChange={(e) => set("marketplace")(e.target.value as Marketplace)}
              disabled={loading}
            >
              {MARKETPLACES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tone" className={labelClasses}>
              Tone
            </label>
            <select
              id="tone"
              className={fieldClasses}
              value={input.tone}
              onChange={(e) => set("tone")(e.target.value as Tone)}
              disabled={loading}
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
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
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Spinner />
              Writing your listing…
            </>
          ) : (
            "Generate listing"
          )}
        </button>

        {!loading && !listing && !error && (
          <p className="text-center text-xs text-stone-400">
            Example: “Hand-poured soy wax candle, lavender”
          </p>
        )}
      </div>

      <div className="min-h-96 space-y-4">
        {!listing && !loading ? (
          <EmptyState hasError={!!error} />
        ) : null}

        {loading ? (
          <div className="flex min-h-96 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-white">
            <Spinner />
            <p className="text-sm text-stone-500">Crafting a high-converting listing…</p>
          </div>
        ) : null}

        {listing ? (
          <>
            <SectionCard
              title="Title"
              extra={<CopyButton text={listing.title} label="title" />}
            >
              <p className="text-base font-medium leading-relaxed text-stone-900">{listing.title}</p>
              <p className="mt-2 text-xs text-stone-400">Short title: {listing.shortTitle}</p>
            </SectionCard>

            <SectionCard
              title="Description"
              extra={<CopyButton text={listing.description} label="description" />}
            >
              <div className="whitespace-pre-line text-sm leading-relaxed text-stone-700">
                {listing.description}
              </div>
            </SectionCard>

            <SectionCard
              title="Key benefits"
              extra={
                <CopyButton text={listing.bulletPoints.join("\n")} label="bullets" />
              }
            >
              <ul className="space-y-2">
                {listing.bulletPoints.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-stone-700">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                    {point}
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard
              title="Tags"
              extra={<CopyButton text={listing.tags.join(", ")} label="tags" />}
            >
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Search keywords"
              extra={<CopyButton text={listing.keywords.join(", ")} label="keywords" />}
            >
              <div className="flex flex-wrap gap-2">
                {listing.keywords.map((k, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </SectionCard>

            {!isPro && (
              <div className="flex items-center justify-between rounded-2xl border border-purple-200 bg-purple-50 p-5">
                <div>
                  <p className="text-sm font-semibold text-purple-900">
                    {creditsLeft > 0 ? "Enjoying it?" : "Out of free listings"}
                  </p>
                  <p className="text-xs text-purple-700">
                    {creditsLeft > 0
                      ? `You have ${creditsLeft} free listing${creditsLeft === 1 ? "" : "s"} left this month.`
                      : "Upgrade to Pro for unlimited AI listings."}
                  </p>
                </div>
                <a
                  href="#pricing"
                  className="shrink-0 rounded-full bg-purple-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-800"
                >
                  Go Pro
                </a>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function EmptyState({ hasError }: { hasError?: boolean }) {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
      <p className="text-4xl">✦</p>
      <div>
        <p className="text-lg font-semibold text-stone-900">
          {hasError ? "Ready when you are" : "Your listing appears here"}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">
          Fill in your product details on the left and hit “Generate listing”. You will get
          a title, description, key benefits, tags, and keywords in seconds.
        </p>
      </div>
    </div>
  );
}