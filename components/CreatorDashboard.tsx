"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import type { Booking, CreatorProfile } from "@/lib/store";

function formatMoney(n: number) {
  return `$${n.toFixed(2)}`;
}

export function CreatorDashboard() {
  const { account, loading } = useAuth();
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [onboarding, setOnboarding] = useState<{
    onboarded: boolean;
    payoutsEnabled: boolean;
    requirements: string[];
  } | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [me, status, all] = await Promise.all([
        fetch("/api/creators/apply").then((r) => r.json()),
        fetch("/api/creators/onboard").then((r) => r.json()),
        fetch("/api/bookings").then((r) => r.json()),
      ]);
      setCreator(me.creator ?? null);
      setOnboarding(status);
      setBookings(all.bookings ?? []);
    } catch {
      // ignore
    }
  }, []);

  const fetchedOnce = useRef(false);
  useEffect(() => {
    if (!account) return;
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    void load();
  }, [account, load]);

  async function startOnboarding() {
    setWorking(true);
    setError(null);
    try {
      const res = await fetch("/api/creators/onboard", { method: "POST" });
      const data = (await res.json()) as { onboardingUrl?: string; error?: string; alreadyOnboarded?: boolean };
      if (data.alreadyOnboarded) {
        await load();
      } else if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      } else {
        setError(data.error ?? "Could not start onboarding.");
      }
    } catch {
      setError("Network error");
    } finally {
      setWorking(false);
    }
  }

  async function updateStatus(id: string, status: Booking["status"]) {
    setWorking(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Could not update booking.");
        return;
      }
      await load();
    } catch {
      setError("Network error");
    } finally {
      setWorking(false);
    }
  }

  if (loading) return <div className="px-4 py-20 text-center text-sm text-ink-400 sm:px-6">Loading…</div>;
  if (!account) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="rounded-3xl border border-ink-200/80 bg-white p-8 text-center shadow-lg shadow-ink-900/5">
          <h2 className="text-xl font-bold text-ink-900">Sign in to access your dashboard</h2>
          <Link href="/account" className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="rounded-3xl border border-ink-200/80 bg-white p-8 text-center shadow-lg shadow-ink-900/5">
          <h2 className="text-xl font-bold text-ink-900">Apply to be a creator first</h2>
          <p className="mt-2 text-sm text-ink-500">You need an approved creator profile to access bookings.</p>
          <Link
            href="/creators/apply"
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white"
          >
            Apply now
          </Link>
        </div>
      </div>
    );
  }

  if (creator.status === "pending") {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-8 text-center shadow-lg shadow-ink-900/5">
          <h2 className="text-xl font-bold text-ink-900">Application under review</h2>
          <p className="mt-2 text-sm text-ink-600">
            We&apos;ll email you within 3 business days. Thanks for your patience!
          </p>
        </div>
      </div>
    );
  }

  if (creator.status === "rejected" || creator.status === "suspended") {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="rounded-3xl border border-red-200 bg-red-50/60 p-8 text-center shadow-lg shadow-ink-900/5">
          <h2 className="text-xl font-bold text-ink-900">Application not approved</h2>
          <p className="mt-2 text-sm text-ink-600">
            Please email <a className="underline" href="mailto:hello@listinglauncher.app">hello@listinglauncher.app</a> for details.
          </p>
        </div>
      </div>
    );
  }

  // Approved creator.
  const needsOnboarding = !onboarding?.payoutsEnabled;

  const totalEarnings = bookings
    .filter((b) => b.status === "completed" && b.paymentStatus === "released")
    .reduce((s, b) => s + (b.creatorPayout ?? b.budget * 0.85), 0);

  const pendingEarnings = bookings
    .filter((b) => b.status === "delivered")
    .reduce((s, b) => s + b.budget * 0.85, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Creator dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">
            Welcome, {creator.name}.{" "}
            <Link href={`/creators/${creator.id}`} className="font-semibold text-brand-600 underline">
              View public profile
            </Link>
          </p>
        </div>
      </div>

      {needsOnboarding ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-ink-900">Set up payouts to receive bookings</h2>
          <p className="mt-2 text-sm text-ink-600">
            You need a connected Stripe account so we can pay you when sellers approve your work.
            Takes 2 minutes.
          </p>
          {error ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <button
            type="button"
            onClick={startOnboarding}
            disabled={working}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-700 disabled:opacity-60"
          >
            {working ? "Opening Stripe…" : "Connect with Stripe"}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Earnings (released)</p>
            <p className="mt-2 text-2xl font-bold text-ink-900">{formatMoney(totalEarnings)}</p>
          </div>
          <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Pending (delivered)</p>
            <p className="mt-2 text-2xl font-bold text-ink-900">{formatMoney(pendingEarnings)}</p>
          </div>
          <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Bookings (all)</p>
            <p className="mt-2 text-2xl font-bold text-ink-900">{bookings.length}</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-400">Your bookings</h2>
        {bookings.length === 0 ? (
          <div className="mt-3 rounded-3xl border border-dashed border-ink-300 bg-white/60 p-10 text-center">
            <p className="text-sm text-ink-500">No bookings yet. Make sure your profile is complete and public.</p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900">{b.listingTitle}</p>
                    <p className="mt-1 text-xs text-ink-500">
                      From {b.sellerEmail} · {b.platform} · {formatMoney(b.budget)} ·{" "}
                      {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                    {b.notes ? <p className="mt-2 text-sm text-ink-600">{b.notes}</p> : null}
                  </div>
                  <BookingBadge status={b.status} payment={b.paymentStatus} />
                </div>
                <BookingActions booking={b} onAction={updateStatus} working={working} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingBadge({ status, payment }: { status: string; payment: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    in_progress: "bg-blue-50 text-blue-700 ring-blue-200",
    delivered: "bg-purple-50 text-purple-700 ring-purple-200",
    completed: "bg-green-50 text-green-700 ring-green-200",
    rejected: "bg-red-50 text-red-700 ring-red-200",
    refunded: "bg-ink-100 text-ink-500 ring-ink-200",
    cancelled: "bg-ink-100 text-ink-500 ring-ink-200",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${map[status] ?? "bg-ink-100 text-ink-600"}`}>
      {status.replace("_", " ")}
      {payment === "released" ? " · paid" : payment === "held" ? " · in escrow" : payment === "refunded" ? " · refunded" : ""}
    </span>
  );
}

function BookingActions({
  booking,
  onAction,
  working,
}: {
  booking: Booking;
  onAction: (id: string, status: Booking["status"]) => void;
  working: boolean;
}) {
  if (booking.status === "pending") {
    return (
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={working}
          onClick={() => onAction(booking.id, "in_progress")}
          className="rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-ink-700"
        >
          Accept booking
        </button>
        <button
          type="button"
          disabled={working}
          onClick={() => onAction(booking.id, "rejected")}
          className="rounded-full border border-ink-200 bg-white px-4 py-2 text-xs font-semibold text-ink-500 hover:border-red-200 hover:text-red-600"
        >
          Decline
        </button>
      </div>
    );
  }
  if (booking.status === "in_progress") {
    return (
      <div className="mt-3">
        <button
          type="button"
          disabled={working}
          onClick={() => onAction(booking.id, "delivered")}
          className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-purple-700"
        >
          Mark as delivered
        </button>
      </div>
    );
  }
  return null;
}
