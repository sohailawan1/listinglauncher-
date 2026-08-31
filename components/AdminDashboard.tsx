"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminStats } from "@/lib/store";

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

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchedOnce = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = (await res.json()) as { stats?: AdminStats; error?: string };
      if (data.stats) {
        setStats(data.stats);
        setAuthed(true);
      } else {
        setError(data.error ?? "Failed to load stats.");
      }
    } catch {
      setError("Could not reach the server.");
    }
  }, []);

  // Initial fetch — state updates happen asynchronously after the fetch
  // resolves, not synchronously inside the effect body.
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

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Owner dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">
            Storage: {stats.storage === "redis" ? "Redis (persistent)" : "in-memory (resets on restart)"}
            {" · "}
            Estimated MRR: ${estIncome}/mo
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
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Users */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-400">Users</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total accounts" value={String(planCounts.total)} sub={`+${planCounts.newToday} today`} />
          <StatCard title="Free users" value={String(planCounts.free)} />
          <StatCard title="Pro users" value={String(planCounts.pro)} sub="$9/mo each" />
          <StatCard title="Business users" value={String(planCounts.business)} sub="$29/mo each" />
        </div>
      </section>

      {/* Traffic & usage */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-400">
          Traffic &amp; usage
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Visits total" value={String(stats.visits.total)} />
          <StatCard title="Visits today" value={String(stats.visits.today)} />
          <StatCard title="Listings total" value={String(stats.listings.total)} sub={`+${stats.listings.today} today`} />
          <StatCard title="Audits total" value={String(stats.audits.total)} />
        </div>
      </section>

      {/* Money */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-400">Money</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Estimated MRR"
            value={`$${estIncome}`}
            sub={`${planCounts.pro} × $9 + ${planCounts.business} × $29`}
          />
          <StatCard title="Estimated AI cost (all time)" value={`$${estAiCost}`} sub="~$0.0005 per listing" />
          <StatCard
            title="Conversion"
            value={planCounts.total ? `${Math.round(((planCounts.pro + planCounts.business) / planCounts.total) * 100)}%` : "0%"}
            sub="free → paid"
          />
        </div>
      </section>

      {/* Errors */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-400">
          Errors (today)
        </h2>
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

      {/* Recent accounts */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-400">
          Newest accounts
        </h2>
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
