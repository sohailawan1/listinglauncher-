"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

const fieldClasses =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

const PLATFORM_OPTIONS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
];

const NICHE_SUGGESTIONS = [
  "Etsy finds",
  "Handmade",
  "Home decor",
  "Vintage",
  "Amazon FBA",
  "Jewelry",
  "Beauty",
  "Tech",
  "Pets",
  "Kids & baby",
];

export function CreatorApplyForm() {
  const { account, loading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    bio: "",
    platforms: ["tiktok"] as string[],
    niches: [] as string[],
    followers: 0,
    rateMin: 25,
    rateMax: 75,
  });
  const [customNiche, setCustomNiche] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "submitted" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<string | null>(null);

  useEffect(() => {
    if (!account) return;
    fetch("/api/creators/apply")
      .then((r) => r.json())
      .then((d) => {
        if (d.creator?.status) setExisting(d.creator.status);
        setForm((f) => ({ ...f, name: f.name || account.name }));
      })
      .catch(() => {});
  }, [account]);

  if (loading) {
    return <div className="px-4 py-20 text-center text-sm text-ink-400 sm:px-6">Loading…</div>;
  }

  if (!account) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="rounded-3xl border border-ink-200/80 bg-white p-8 text-center shadow-lg shadow-ink-900/5">
          <h2 className="text-xl font-bold text-ink-900">Sign in first</h2>
          <p className="mt-2 text-sm text-ink-500">
            You need an account to apply. It takes 10 seconds.
          </p>
          <Link
            href="/account"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-700"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  if (existing) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="rounded-3xl border border-ink-200/80 bg-white p-8 text-center shadow-lg shadow-ink-900/5">
          <h2 className="text-xl font-bold text-ink-900">Application {existing}</h2>
          <p className="mt-2 text-sm text-ink-500">
            {existing === "pending"
              ? "We received your application. We'll review and email you within 3 days."
              : existing === "approved"
                ? "You're approved! Head to your dashboard to set up payouts and start receiving bookings."
                : "Your application was not approved at this time. Please contact support if you think this is a mistake."}
          </p>
          {existing === "approved" ? (
            <Link
              href="/creators/dashboard"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-700"
            >
              Open creator dashboard
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  function togglePlatform(p: string) {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }));
  }
  function toggleNiche(n: string) {
    setForm((f) => ({
      ...f,
      niches: f.niches.includes(n) ? f.niches.filter((x) => x !== n) : [...f.niches, n],
    }));
  }
  function addCustomNiche() {
    const n = customNiche.trim().slice(0, 40);
    if (!n || form.niches.includes(n)) return;
    setForm((f) => ({ ...f, niches: [...f.niches, n] }));
    setCustomNiche("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/creators/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { creator?: unknown; error?: string };
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Could not submit.");
        return;
      }
      setStatus("submitted");
    } catch {
      setStatus("error");
      setError("Network error");
    }
  }

  if (status === "submitted") {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="rounded-3xl border border-ink-200/80 bg-white p-8 text-center shadow-lg shadow-ink-900/5">
          <h2 className="text-xl font-bold text-ink-900">Application submitted 🎉</h2>
          <p className="mt-2 text-sm text-ink-500">
            We&apos;ll review your application within 3 business days and email you
            the result. Once approved, you can set up payouts and start receiving
            bookings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6">
      <form onSubmit={submit} className="space-y-5 rounded-3xl border border-ink-200/80 bg-white p-6 shadow-lg shadow-ink-900/5 sm:p-8">
        <div>
          <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium text-ink-700">
            Display name
          </label>
          <input
            id="c-name"
            className={fieldClasses}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="How sellers see you"
            required
          />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-700">Platforms</span>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_OPTIONS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => togglePlatform(p.value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  form.platforms.includes(p.value)
                    ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20"
                    : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-700">Niches</span>
          <div className="flex flex-wrap gap-1.5">
            {NICHE_SUGGESTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => toggleNiche(n)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  form.niches.includes(n)
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
                }`}
              >
                {form.niches.includes(n) ? "✓ " : "+ "}
                {n}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={customNiche}
              onChange={(e) => setCustomNiche(e.target.value)}
              placeholder="Add your own niche…"
              className={`${fieldClasses} flex-1`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomNiche();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomNiche}
              className="rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-700 hover:bg-ink-50"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="c-followers" className="mb-1.5 block text-sm font-medium text-ink-700">
            Total followers across platforms
          </label>
          <input
            id="c-followers"
            type="number"
            min={0}
            className={fieldClasses}
            value={form.followers}
            onChange={(e) => setForm({ ...form, followers: Number(e.target.value) })}
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="c-rate-min" className="mb-1.5 block text-sm font-medium text-ink-700">
              Min rate ($)
            </label>
            <input
              id="c-rate-min"
              type="number"
              min={5}
              className={fieldClasses}
              value={form.rateMin}
              onChange={(e) => setForm({ ...form, rateMin: Number(e.target.value) })}
            />
          </div>
          <div>
            <label htmlFor="c-rate-max" className="mb-1.5 block text-sm font-medium text-ink-700">
              Max rate ($)
            </label>
            <input
              id="c-rate-max"
              type="number"
              min={form.rateMin}
              className={fieldClasses}
              value={form.rateMax}
              onChange={(e) => setForm({ ...form, rateMax: Number(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label htmlFor="c-bio" className="mb-1.5 block text-sm font-medium text-ink-700">
            Bio <span className="text-ink-400">(20+ chars)</span>
          </label>
          <textarea
            id="c-bio"
            className={`${fieldClasses} min-h-28 resize-y`}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell sellers about your audience, your style, and why they should hire you…"
            required
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-60"
        >
          {status === "sending" ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </div>
  );
}
