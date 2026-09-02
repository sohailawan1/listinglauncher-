"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminStats, Booking, CreatorProfile } from "@/lib/store";

type Panel = { title: string; value: string; sub?: string };

function StatCard({ title, value, sub }: Panel) {
  return (
    <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{title}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-ink-900">{value}</p>
      {sub ? <p className="mt-1 text-xs text-ink-500">{sub}</p> : null}
    </div>
  );
}

function Login({ onLogin }: { onLogin: (password: string) => Promise<boolean> }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const ok = await onLogin(password);
    if (!ok) setError("Wrong password.");
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-ink-200 bg-white p-8 shadow-xl"
      >
        <h1 className="text-xl font-bold text-ink-900">Owner dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">Enter your admin password to continue.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          autoFocus
          className="mt-6 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
        />
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy || !password}
          className="mt-4 w-full rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-ink-700 disabled:opacity-50"
        >
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

type Tab = "overview" | "creators" | "bookings" | "errors";

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [working, setWorking] = useState<string | null>(null);
  const fetchedOnce = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = (await res.json()) as {
        stats?: AdminStats;
        creators?: CreatorProfile[];
        bookings?: Booking[];
        error?: string;
      };
      if (data.stats) {
        setStats(data.stats);
        setCreators(data.creators ?? []);
        setBookings(data.bookings ?? []);
        setAuthed(true);
      } else {
        setError(data.error ?? "Failed to load stats.");
      }
    } catch {
      setError("Could not reach the server.");
    }
  }, []);

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    void load();
  }, [load]);

  async function handleLogin(password: string): Promise<boolean> {
    const res = await fetch("/api/admin/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { stats?: AdminStats };
    if (data.stats) {
      setStats(data.stats);
      setAuthed(true);
    }
    return res.ok;
  }

  async function approveCreator(id: string) {
    setWorking(id);
    try {
      await fetch("/api/admin/creators", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "approved" }),
      });
      await load();
    } finally {
      setWorking(null);
    }
  }
  async function rejectCreator(id: string) {
    setWorking(id);
    try {
      await fetch("/api/admin/creators", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "rejected" }),
      });
      await load();
    } finally {
      setWorking(null);
    }
  }
  async function releaseBooking(id: string) {
    setWorking(id);
    try {
      const res = await fetch("/api/admin/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, action: "release" }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) alert(data.error ?? "Release failed.");
      await load();
    } finally {
      setWorking(null);
    }
  }

  if (authed === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink-400">
        Loading dashboard…
      </div>
    );
  }

  if (authed === false) {
    return <Login onLogin={handleLogin} />;
  }

  if (!stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-red-500">
        {error ?? "No data."}
      </div>
    );
  }

  const planCounts = stats.accounts;
  const estIncome = planCounts.pro * 9 + planCounts.business * 29;
  const estAiCost = (stats.listings.total * 0.0005).toFixed(2);
  const platformFeeEarned = bookings
    .filter((b) => b.status === "completed" && b.paymentStatus === "released")
    .reduce((s, b) => s + (b.platformFee ?? 0), 0);

  const tabs: { value: Tab; label: string; badge?: number }[] = [
    { value: "overview", label: "Overview" },
    { value: "creators", label: "Creators", badge: creators.filter((c) => c.status === "pending").length },
    { value: "bookings", label: "Bookings", badge: bookings.filter((b) => b.status === "delivered").length },
    { value: "errors", label: "Errors" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Owner dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">
            Storage: {stats.storage === "redis" ? "Redis (persistent)" : "in-memory (resets on restart)"}
            {" · "}
            Estimated MRR: <strong>${estIncome}/mo</strong>
            {platformFeeEarned > 0 ? ` · Creator fees earned: $${platformFeeEarned.toFixed(2)}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            className="rounded-full border border-ink-200 bg-white px-4 py-2 text-xs font-semibold text-ink-700 transition-all hover:bg-ink-100"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/admin/stats", { method: "DELETE" });
              setAuthed(false);
            }}
            className="rounded-full border border-ink-200 bg-white px-4 py-2 text-xs font-semibold text-ink-500 transition-all hover:border-red-200 hover:text-red-600"
          >
            Sign out
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 rounded-full border border-ink-200 bg-white p-1 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              tab === t.value ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-100"
            }`}
          >
            {t.label}
            {t.badge && t.badge > 0 ? (
              <span
                className={`rounded-full px-1.5 text-[10px] ${
                  tab === t.value ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
                }`}
              >
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <>
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-400">Users</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total accounts" value={String(planCounts.total)} sub={`+${planCounts.newToday} today`} />
              <StatCard title="Free users" value={String(planCounts.free)} />
              <StatCard title="Pro users" value={String(planCounts.pro)} sub="$9/mo each" />
              <StatCard title="Business users" value={String(planCounts.business)} sub="$29/mo each" />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-400">Traffic &amp; usage</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Visits total" value={String(stats.visits.total)} />
              <StatCard title="Visits today" value={String(stats.visits.today)} />
              <StatCard title="Listings total" value={String(stats.listings.total)} sub={`+${stats.listings.today} today`} />
              <StatCard title="Audits total" value={String(stats.audits.total)} />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-400">Money</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Subscription MRR"
                value={`$${estIncome}`}
                sub={`${planCounts.pro} × $9 + ${planCounts.business} × $29`}
              />
              <StatCard
                title="Creator marketplace fees"
                value={`$${platformFeeEarned.toFixed(2)}`}
                sub="15% of completed bookings"
              />
              <StatCard
                title="AI cost (all time)"
                value={`$${estAiCost}`}
                sub="~$0.0005 per listing"
              />
            </div>
          </section>
        </>
      ) : null}

      {tab === "creators" ? (
        <section>
          {creators.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-ink-300 bg-white/60 p-10 text-center text-sm text-ink-500">
              No creator applications yet.
            </p>
          ) : (
            <div className="space-y-3">
              {creators.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink-900">{c.name}</p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ring-1 ${
                          c.status === "approved"
                            ? "bg-green-50 text-green-700 ring-green-200"
                            : c.status === "pending"
                              ? "bg-amber-50 text-amber-700 ring-amber-200"
                              : c.status === "rejected"
                                ? "bg-red-50 text-red-700 ring-red-200"
                                : "bg-ink-100 text-ink-600 ring-ink-200"
                        }`}
                      >
                        {c.status}
                      </span>
                      {c.stripeOnboarded ? (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-200">
                          payouts ✓
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-ink-500">
                      {c.email} · {c.platforms.join(", ")} · {c.followers.toLocaleString()} followers · ${c.rateMin}–${c.rateMax}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-ink-600">{c.bio}</p>
                    <p className="mt-1 text-xs text-ink-400">Niches: {c.niches.join(", ")}</p>
                  </div>
                  {c.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => approveCreator(c.id)}
                        disabled={working === c.id}
                        className="rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-green-700 disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectCreator(c.id)}
                        disabled={working === c.id}
                        className="rounded-full border border-ink-200 bg-white px-4 py-2 text-xs font-semibold text-ink-500 hover:border-red-200 hover:text-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {tab === "bookings" ? (
        <section>
          {bookings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-ink-300 bg-white/60 p-10 text-center text-sm text-ink-500">
              No bookings yet.
            </p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-900">{b.listingTitle}</p>
                      <p className="mt-1 text-xs text-ink-500">
                        {b.sellerEmail} → {b.creatorName} · {b.platform} · ${b.budget}
                      </p>
                      <p className="mt-1 text-xs text-ink-400">
                        Created {new Date(b.createdAt).toLocaleString()}
                        {b.deliveredAt ? ` · Delivered ${new Date(b.deliveredAt).toLocaleString()}` : ""}
                        {b.completedAt ? ` · Completed ${new Date(b.completedAt).toLocaleString()}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                          b.status === "completed"
                            ? "bg-green-50 text-green-700 ring-green-200"
                            : b.status === "delivered"
                              ? "bg-purple-50 text-purple-700 ring-purple-200"
                              : b.status === "in_progress"
                                ? "bg-blue-50 text-blue-700 ring-blue-200"
                                : b.status === "pending"
                                  ? "bg-amber-50 text-amber-700 ring-amber-200"
                                  : "bg-ink-100 text-ink-600 ring-ink-200"
                        }`}
                      >
                        {b.status} · {b.paymentStatus}
                      </span>
                      {b.creatorPayout ? (
                        <p className="text-xs text-ink-500">
                          Creator: ${b.creatorPayout.toFixed(2)} · Fee: ${b.platformFee?.toFixed(2)}
                        </p>
                      ) : null}
                      {b.status === "delivered" ? (
                        <button
                          type="button"
                          onClick={() => releaseBooking(b.id)}
                          disabled={working === b.id}
                          className="rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-green-700 disabled:opacity-60"
                        >
                          {working === b.id ? "Releasing…" : "Release payout"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {tab === "errors" ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-400">Errors (today)</h2>
          {Object.keys(stats.errors).length === 0 ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
              No errors recorded today.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(stats.errors).map(([kind, count]) => (
                <StatCard key={kind} title={kind} value={String(count)} sub="today" />
              ))}
            </div>
          )}
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-400">Newest accounts</h2>
        <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentAccounts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ink-400">
                    No accounts yet.
                  </td>
                </tr>
              ) : (
                stats.recentAccounts.map((a) => (
                  <tr key={a.email} className="border-t border-ink-100">
                    <td className="px-4 py-3 font-medium text-ink-800">{a.name}</td>
                    <td className="px-4 py-3 text-ink-600">{a.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          a.plan === "business"
                            ? "bg-amber-100 text-amber-700"
                            : a.plan === "pro"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-ink-100 text-ink-600"
                        }`}
                      >
                        {a.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
