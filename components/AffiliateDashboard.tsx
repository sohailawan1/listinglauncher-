"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import type { Affiliate, AffiliateReferral } from "@/lib/store";

export function AffiliateDashboard() {
  const { account, loading } = useAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([]);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const loaded = useRef(false);

  useEffect(() => {
    if (!account) return;
    if (loaded.current) return;
    loaded.current = true;
    fetch("/api/affiliate")
      .then((r) => r.json())
      .then((d) => {
        setAffiliate(d.affiliate ?? null);
        setReferrals(d.referrals ?? []);
      })
      .catch(() => {});
  }, [account]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Defer to next tick to keep state updates off the effect's synchronous path.
    const id = window.setTimeout(() => setOrigin(window.location.origin), 0);
    return () => window.clearTimeout(id);
  }, []);

  async function join() {
    setWorking(true);
    setError(null);
    try {
      const res = await fetch("/api/affiliate", { method: "POST" });
      const data = (await res.json()) as { affiliate?: Affiliate; error?: string };
      if (!res.ok || !data.affiliate) {
        setError(data.error ?? "Could not enroll.");
        return;
      }
      setAffiliate(data.affiliate);
    } finally {
      setWorking(false);
    }
  }

  if (loading) return <div className="px-4 py-20 text-center text-sm text-ink-400 sm:px-6">Loading…</div>;
  if (!account) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="rounded-3xl border border-ink-200/80 bg-white p-8 text-center shadow-lg shadow-ink-900/5">
          <h2 className="text-xl font-bold text-ink-900">Sign in to view your affiliate dashboard</h2>
          <Link
            href="/account"
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-ink-900">Affiliate program</h1>
      <p className="mt-1 text-sm text-ink-500">
        Earn <strong>30% recurring</strong> for every seller you refer, for 12 months.
      </p>

      {!affiliate ? (
        <div className="mt-8 rounded-3xl border border-brand-200 bg-gradient-to-br from-white to-brand-50/50 p-8 shadow-lg shadow-ink-900/5">
          <h2 className="text-xl font-bold text-ink-900">Start earning in 10 seconds</h2>
          <p className="mt-2 text-sm text-ink-600">
            You&apos;ll get a unique link to share. When someone signs up and pays
            for Pro or Business, you earn 30% of their subscription every month for
            a year. We track it, you get paid via Stripe.
          </p>
          {error ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}
          <button
            type="button"
            onClick={join}
            disabled={working}
            className="mt-5 inline-flex rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {working ? "Enrolling…" : "Become an affiliate"}
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Your code</p>
              <p className="mt-2 font-mono text-2xl font-bold text-ink-900">{affiliate.code}</p>
            </div>
            <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Total referrals</p>
              <p className="mt-2 text-2xl font-bold text-ink-900">{referrals.length}</p>
            </div>
            <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Commission rate</p>
              <p className="mt-2 text-2xl font-bold text-ink-900">{affiliate.rate}%</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-ink-200/80 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-400">Your affiliate link</h2>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                readOnly
                value={origin ? `${origin}/?ref=${affiliate.code}` : ""}
                className="flex-1 rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 font-mono text-xs text-ink-700"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={() => {
                  if (origin) navigator.clipboard?.writeText(`${origin}/?ref=${affiliate.code}`);
                }}
                className="rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white hover:bg-ink-700"
              >
                Copy
              </button>
            </div>
            <p className="mt-3 text-xs text-ink-500">
              The redirect link <code className="rounded bg-ink-100 px-1.5 py-0.5">/r/{affiliate.code}</code> also works
              and is shorter for social bios.
            </p>
          </div>

          {referrals.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-400">
                  <tr>
                    <th className="px-4 py-3">Referred user</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r.id} className="border-t border-ink-100">
                      <td className="px-4 py-3 font-mono text-xs text-ink-500">
                        {r.referredAccountId.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 text-ink-600">
                        {new Date(r.recordedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right text-ink-700">
                        {r.monthlyAmount > 0 ? `$${r.monthlyAmount.toFixed(2)}/mo` : "Free"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
