"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CreatorProfile } from "@/lib/store";
import { useAuth } from "@/components/AuthContext";

type Review = {
  id: string;
  rating: number;
  text: string;
  createdAt: number;
};

const PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
] as const;

const fieldClasses =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

export function CreatorProfileView({ id }: { id: string }) {
  const params = useSearchParams();
  const reviewMode = params.get("review") === "1";
  const reviewBookingId = params.get("booking") ?? "";
  const { account } = useAuth();

  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking form state
  const [form, setForm] = useState({
    listingTitle: "",
    productLink: "",
    platform: "tiktok" as (typeof PLATFORMS)[number]["value"],
    budget: 50,
    notes: "",
  });
  const [bookingStatus, setBookingStatus] = useState<"idle" | "sending" | "booked" | "error">("idle");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [reviewText, setReviewText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/creators/${id}`);
      const data = (await res.json()) as { creator?: CreatorProfile; reviews?: Review[]; rating?: number; reviewCount?: number; error?: string };
      if (!res.ok || !data.creator) {
        setError(data.error ?? "Creator not found");
        return;
      }
      setCreator(data.creator);
      setReviews(data.reviews ?? []);
      setRating(data.rating ?? 0);
      setReviewCount(data.reviewCount ?? 0);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchedOnce = useRef(false);
  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    void load();
  }, [load]);

  async function book(e: React.FormEvent) {
    e.preventDefault();
    setBookingStatus("sending");
    setBookingError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: id, ...form }),
      });
      const data = (await res.json()) as { booking?: unknown; error?: string };
      if (!res.ok) {
        setBookingStatus("error");
        setBookingError(data.error ?? "Could not create your booking.");
        return;
      }
      setBookingStatus("booked");
    } catch {
      setBookingStatus("error");
      setBookingError("Could not reach the server.");
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || reviewText.trim().length < 5) {
      setReviewStatus("error");
      return;
    }
    setReviewStatus("sending");
    try {
      const res = await fetch(`/api/creators/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: reviewBookingId, rating, text: reviewText }),
      });
      if (!res.ok) {
        setReviewStatus("error");
        return;
      }
      setReviewStatus("done");
      setReviewText("");
      setRating(0);
      load();
    } catch {
      setReviewStatus("error");
    }
  }

  if (loading) return <div className="px-4 py-20 text-center text-sm text-ink-400 sm:px-6">Loading…</div>;
  if (error || !creator) return <div className="px-4 py-20 text-center text-sm text-red-500 sm:px-6">{error ?? "Not found"}</div>;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-ink-200/80 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-5">
              <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-3xl font-bold text-white shadow-lg">
                {creator.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-ink-900">{creator.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-500">
                  <span>{creator.platforms.map((p) => PLATFORMS.find((x) => x.value === p)?.label ?? p).join(" · ")}</span>
                  {creator.followers > 0 ? (
                    <span>· {creator.followers.toLocaleString()} followers</span>
                  ) : null}
                  {rating > 0 ? (
                    <span className="ml-1 flex items-center gap-1 text-amber-600">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {rating} ({reviewCount})
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {creator.niches.map((n) => (
                    <span key={n} className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-6 leading-relaxed text-ink-700">{creator.bio}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-ink-50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">From</p>
                <p className="mt-1 text-lg font-bold text-ink-900">${creator.rateMin}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Up to</p>
                <p className="mt-1 text-lg font-bold text-ink-900">${creator.rateMax}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Status</p>
                <p className="mt-1 text-lg font-bold text-green-600">Accepting</p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          {reviewMode && account ? (
            <form
              onSubmit={submitReview}
              className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold text-ink-900">How was the promotion?</h2>
              <div className="mt-3 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`${n} stars`}
                    className="p-1"
                  >
                    <svg
                      className={`h-7 w-7 ${n <= rating ? "text-amber-500" : "text-ink-300"} transition-colors`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell other sellers about your experience…"
                className={`${fieldClasses} mt-3 min-h-24 resize-y`}
              />
              {reviewStatus === "error" ? (
                <p className="mt-2 text-sm text-red-600">Pick a rating and write at least 5 characters.</p>
              ) : null}
              {reviewStatus === "done" ? (
                <p className="mt-2 text-sm text-green-700">Thanks! Your review is live.</p>
              ) : null}
              <button
                type="submit"
                disabled={reviewStatus === "sending"}
                className="mt-3 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-700"
              >
                {reviewStatus === "sending" ? "Posting…" : "Post review"}
              </button>
            </form>
          ) : null}

          <div className="rounded-3xl border border-ink-200/80 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-400">
              Reviews ({reviewCount})
            </h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">No reviews yet. Be the first to hire this creator.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <svg key={i} className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-ink-700">{r.text}</p>
                    <p className="mt-1.5 text-xs text-ink-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Booking form */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-ink-200/80 bg-white p-6 shadow-lg shadow-ink-900/5 sm:p-8">
            <h2 className="text-lg font-bold text-ink-900">Hire {creator.name.split(" ")[0]}</h2>
            <p className="mt-1 text-xs text-ink-500">Money is held in escrow and released when the work is approved.</p>

            {bookingStatus === "booked" ? (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                <p className="font-semibold">Booking created 🎉</p>
                <p className="mt-1">
                  We&apos;ll email you when {creator.name.split(" ")[0]} accepts. Payment is held in escrow
                  and released only when you approve the work.
                </p>
                <Link
                  href="/creators"
                  className="mt-2 inline-flex text-xs font-semibold text-green-700 underline"
                >
                  Browse more creators
                </Link>
              </div>
            ) : !account ? (
              <div className="mt-4 rounded-xl border border-ink-200 bg-ink-50 p-4 text-sm text-ink-700">
                <Link href="/account" className="font-semibold text-brand-600 underline">
                  Sign in or create an account
                </Link>{" "}
                to hire this creator.
              </div>
            ) : (
              <form onSubmit={book} className="mt-4 space-y-3">
                <div>
                  <label htmlFor="b-title" className="mb-1.5 block text-sm font-medium text-ink-700">
                    Listing to promote
                  </label>
                  <input
                    id="b-title"
                    className={fieldClasses}
                    value={form.listingTitle}
                    onChange={(e) => setForm({ ...form, listingTitle: e.target.value })}
                    placeholder="Lavender soy candle, hand-poured"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="b-link" className="mb-1.5 block text-sm font-medium text-ink-700">
                    Product link
                  </label>
                  <input
                    id="b-link"
                    className={fieldClasses}
                    value={form.productLink}
                    onChange={(e) => setForm({ ...form, productLink: e.target.value })}
                    placeholder="https://etsy.com/listing/…"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="b-plat" className="mb-1.5 block text-sm font-medium text-ink-700">
                      Platform
                    </label>
                    <select
                      id="b-plat"
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
                    <label htmlFor="b-budget" className="mb-1.5 block text-sm font-medium text-ink-700">
                      Budget
                    </label>
                    <input
                      id="b-budget"
                      type="number"
                      min={creator.rateMin || 15}
                      className={fieldClasses}
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="b-notes" className="mb-1.5 block text-sm font-medium text-ink-700">
                    Brief
                  </label>
                  <textarea
                    id="b-notes"
                    className={`${fieldClasses} min-h-20 resize-y`}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="What to highlight, ideal audience, link to ship samples…"
                  />
                </div>
                {bookingError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {bookingError}
                  </div>
                ) : null}
                <button
                  type="submit"
                  disabled={bookingStatus === "sending"}
                  className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {bookingStatus === "sending"
                    ? "Booking…"
                    : `Book for $${form.budget} (held in escrow)`}
                </button>
                <p className="text-center text-[11px] text-ink-400">
                  You can cancel and request a refund before the creator accepts.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
