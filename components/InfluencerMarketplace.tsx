"use client";

import { useState } from "react";
import Link from "next/link";

const fieldClasses =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm transition-all placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

const PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
] as const;

const influencers = [
  {
    name: "Handmade with Holly",
    platform: "TikTok",
    followers: "84K",
    niche: "Etsy finds & craft hacks",
    rate: "$25–60/post",
    accent: "from-ink-900 to-ink-700",
    initial: "H",
  },
  {
    name: "The Seller Desk",
    platform: "YouTube",
    followers: "31K",
    niche: "Amazon FBA tips",
    rate: "$40–90/video",
    accent: "from-red-500 to-red-700",
    initial: "S",
  },
  {
    name: "Cozy Cottage Interiors",
    platform: "Instagram",
    followers: "120K",
    niche: "Home decor & gifts",
    rate: "$50–120/story",
    accent: "from-purple-500 to-purple-700",
    initial: "C",
  },
];

export function InfluencerMarketplace() {
  const [form, setForm] = useState({
    listingTitle: "",
    productLink: "",
    platform: "tiktok" as (typeof PLATFORMS)[number]["value"],
    budget: 25,
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { booking?: unknown; error?: string };
      if (!res.ok || !data.booking) {
        setStatus("error");
        setMessage(data.error ?? "Could not create your request.");
        return;
      }
      setStatus("done");
      setMessage("Request sent! We will email you when a creator accepts.");
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Try again.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      {/* How it works */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            step: "1",
            title: "Post your listing",
            body: "Paste the listing you want promoted and set your budget.",
          },
          {
            step: "2",
            title: "Creators apply",
            body: "Influencers in your niche see your product and send offers.",
          },
          {
            step: "3",
            title: "Get promoted",
            body: "Approve a creator, they promote your listing, you get sales.",
          },
        ].map((s) => (
          <div
            key={s.step}
            className="rounded-3xl border border-ink-200/80 bg-white p-6 shadow-sm"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-md shadow-brand-500/30">
              {s.step}
            </span>
            <h3 className="mt-4 font-semibold text-ink-900">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{s.body}</p>
          </div>
        ))}
      </div>

      {/* Featured creators */}
      <div className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink-900">Featured creators</h2>
            <p className="mt-1 text-sm text-ink-500">
              Niche seller audiences — the kind that actually buy.
            </p>
          </div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
            Launching with 50+ creators
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {influencers.map((inf) => (
            <div
              key={inf.name}
              className="rounded-3xl border border-ink-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${inf.accent} text-lg font-bold text-white`}
                >
                  {inf.initial}
                </span>
                <div>
                  <p className="font-semibold text-ink-900">{inf.name}</p>
                  <p className="text-xs text-ink-400">
                    {inf.platform} · {inf.followers} followers
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink-600">{inf.niche}</p>
              <p className="mt-2 text-sm font-semibold text-ink-900">{inf.rate}</p>
              <p className="mt-0.5 text-xs text-ink-400">You pay creators directly — we take $0</p>
            </div>
          ))}
        </div>
      </div>

      {/* Booking form */}
      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink-900">
            Get your listing promoted
          </h2>
          <p className="mt-2 leading-relaxed text-ink-600">
            You generated a listing with ListingLauncher — now put it in front of
            buyers. Tell us about the product and your budget, and we match you
            with creators in your niche. You keep 100% of the sales.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Your listing, promoted by trusted niche voices",
              "You approve every creator before they post",
              "Pay per post — no agency fees, no subscription",
              "ListingLauncher earns nothing from your deal",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-ink-700">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-200">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-3xl border border-ink-200/80 bg-white p-6 shadow-lg shadow-ink-900/5 sm:p-8"
        >
          <div>
            <label htmlFor="inf-title" className="mb-1.5 block text-sm font-medium text-ink-700">
              Listing / product name
            </label>
            <input
              id="inf-title"
              className={fieldClasses}
              value={form.listingTitle}
              onChange={(e) => setForm({ ...form, listingTitle: e.target.value })}
              placeholder="Lavender soy candle, hand-poured"
              required
            />
          </div>

          <div>
            <label htmlFor="inf-link" className="mb-1.5 block text-sm font-medium text-ink-700">
              Product link <span className="text-ink-400">(optional)</span>
            </label>
            <input
              id="inf-link"
              className={fieldClasses}
              value={form.productLink}
              onChange={(e) => setForm({ ...form, productLink: e.target.value })}
              placeholder="https://etsy.com/your-shop/…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="inf-platform" className="mb-1.5 block text-sm font-medium text-ink-700">
                Platform
              </label>
              <select
                id="inf-platform"
                className={fieldClasses}
                value={form.platform}
                onChange={(e) =>
                  setForm({ ...form, platform: e.target.value as (typeof PLATFORMS)[number]["value"] })
                }
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="inf-budget" className="mb-1.5 block text-sm font-medium text-ink-700">
                Budget ($)
              </label>
              <input
                id="inf-budget"
                type="number"
                min={5}
                max={10000}
                className={fieldClasses}
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="inf-notes" className="mb-1.5 block text-sm font-medium text-ink-700">
              Anything creators should know <span className="text-ink-400">(optional)</span>
            </label>
            <textarea
              id="inf-notes"
              className={`${fieldClasses} min-h-20 resize-y`}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ideal audience, promo code, timing…"
            />
          </div>

          {status === "error" ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </div>
          ) : null}
          {status === "done" ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}{" "}
              <Link href="/library" className="font-semibold underline">
                Back to your library
              </Link>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Request promotion"}
          </button>
        </form>
      </div>
    </div>
  );
}
