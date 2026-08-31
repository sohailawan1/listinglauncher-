"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

const fieldClasses =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm transition-all placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

const PLAN_META = {
  free: { label: "Free", limit: "3 listings/month", next: "pro" as const },
  pro: { label: "Pro", limit: "300 listings/month", next: "business" as const },
  business: { label: "Business", limit: "2,000 listings/month", next: null },
};

export function AccountView() {
  const { account, loading, login, register, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err =
      mode === "login"
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password);
    if (err) setError(err);
    setBusy(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-400">
        Loading…
      </div>
    );
  }

  if (account) {
    const meta = PLAN_META[account.plan];
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <div className="rounded-3xl border border-ink-200/80 bg-white p-8 shadow-lg shadow-ink-900/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Signed in
              </p>
              <h1 className="mt-1 text-2xl font-bold text-ink-900">{account.name}</h1>
              <p className="text-sm text-ink-500">{account.email}</p>
            </div>
            <span
              className={`rounded-full px-3.5 py-1 text-xs font-semibold ring-1 ${
                account.plan === "business"
                  ? "bg-amber-50 text-amber-700 ring-amber-200"
                  : account.plan === "pro"
                    ? "bg-purple-50 text-purple-700 ring-purple-200"
                    : "bg-ink-100 text-ink-600 ring-ink-200"
              }`}
            >
              {meta.label}
            </span>
          </div>

          <div className="mt-6 rounded-2xl bg-ink-50 p-5">
            <p className="text-sm font-medium text-ink-700">Your plan includes</p>
            <p className="mt-1 text-lg font-bold text-ink-900">{meta.limit}</p>
            {account.plan === "free" ? (
              <p className="mt-1 text-xs text-ink-500">+ Listing Audit + Library</p>
            ) : (
              <p className="mt-1 text-xs text-ink-500">
                + Listing Audit + Bulk CSV + Library
              </p>
            )}
          </div>

          {meta.next ? (
            <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-brand-50 p-5">
              <div>
                <p className="text-sm font-semibold text-purple-900">
                  {meta.next === "pro" ? "Go Pro — $9/mo" : "Scale to Business — $29/mo"}
                </p>
                <p className="text-xs text-purple-700">
                  {meta.next === "pro"
                    ? "300 listings/month + bulk + audits"
                    : "2,000 listings/month + 200-row bulk"}
                </p>
              </div>
              <Link
                href="/#pricing"
                className="shrink-0 rounded-full bg-purple-700 px-4 py-2 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-800"
              >
                Upgrade
              </Link>
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Link
              href="/generate"
              className="rounded-xl bg-ink-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-ink-700"
            >
              Generate
            </Link>
            <Link
              href="/library"
              className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-ink-800 transition-all hover:bg-ink-100"
            >
              Library
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-500 transition-all hover:border-red-200 hover:text-red-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6">
      <div className="rounded-3xl border border-ink-200/80 bg-white p-8 shadow-lg shadow-ink-900/5">
        <div className="mb-6 flex rounded-full bg-ink-100 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              mode === "login" ? "bg-white text-ink-900 shadow" : "text-ink-500"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              mode === "register" ? "bg-white text-ink-900 shadow" : "text-ink-500"
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "register" ? (
            <div>
              <label htmlFor="acc-name" className="mb-1.5 block text-sm font-medium text-ink-700">
                Name
              </label>
              <input
                id="acc-name"
                className={fieldClasses}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="acc-email" className="mb-1.5 block text-sm font-medium text-ink-700">
              Email
            </label>
            <input
              id="acc-email"
              type="email"
              className={fieldClasses}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="acc-pass" className="mb-1.5 block text-sm font-medium text-ink-700">
              Password <span className="text-ink-400">(min 8 characters)</span>
            </label>
            <input
              id="acc-pass"
              type="password"
              className={fieldClasses}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              minLength={8}
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
            disabled={busy}
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create free account"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-400">
          Free account: 3 listings + 1 audit every month. No credit card.
        </p>
      </div>
    </div>
  );
}
