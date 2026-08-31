"use client";

import { useState } from "react";
import Link from "next/link";
import type { AuditReport, Marketplace } from "@/lib/types";
import { ListingDisplay, Spinner } from "@/components/ListingUI";
import { useAuth } from "@/components/AuthContext";

const MARKETPLACES: { value: Marketplace | "other"; label: string }[] = [
  { value: "etsy", label: "Etsy" },
  { value: "amazon", label: "Amazon" },
  { value: "shopify", label: "Shopify" },
  { value: "ebay", label: "eBay" },
  { value: "other", label: "Other" },
];

const fieldClasses =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm transition-all placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

const SEVERITY_STYLES: Record<string, { badge: string; label: string }> = {
  high: { badge: "bg-red-100 text-red-700 ring-red-200", label: "High impact" },
  medium: { badge: "bg-amber-100 text-amber-700 ring-amber-200", label: "Worth fixing" },
  low: { badge: "bg-sky-100 text-sky-700 ring-sky-200", label: "Polish" },
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-500";
  return "text-red-500";
}

function scoreRing(score: number): string {
  if (score >= 80) return "stroke-green-500";
  if (score >= 60) return "stroke-amber-500";
  return "stroke-red-500";
}

export function Auditor() {
  const { account, loading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [marketplace, setMarketplace] = useState<Marketplace>("etsy");
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);

  // ---- sign-in wall ----
  if (!loading && !account) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="rounded-3xl border border-ink-200/80 bg-white p-8 text-center shadow-lg shadow-ink-900/5">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-amber-50 text-2xl shadow-sm ring-1 ring-brand-100">
            🔍
          </span>
          <h2 className="mt-5 text-xl font-bold text-ink-900">Create your free account</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">
            Your free plan includes 1 listing audit every month. Create an
            account to start — no credit card.
          </p>
          <Link
            href="/account"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5"
          >
            Create free account
          </Link>
        </div>
      </div>
    );
  }

  async function audit() {
    if (!title.trim() && !description.trim()) {
      setError("Paste at least a title or a description.");
      return;
    }

    setLoadingAudit(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          tags: tagsText
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          marketplace,
        }),
      });

      const data = (await res.json()) as { report?: AuditReport | null; error?: string };

      if (!res.ok || !data.report) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setReport(data.report);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoadingAudit(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[440px_1fr]">
      <div className="space-y-5 self-start rounded-3xl border border-ink-200/80 bg-white p-6 shadow-lg shadow-ink-900/5 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold text-ink-900">Paste your listing</h2>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-700">Marketplace</span>
          <select
            className={fieldClasses}
            value={marketplace}
            onChange={(e) => setMarketplace(e.target.value as Marketplace)}
            disabled={loadingAudit}
          >
            {MARKETPLACES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="audit-title" className="mb-1.5 block text-sm font-medium text-ink-700">
            Current title
          </label>
          <input
            id="audit-title"
            className={fieldClasses}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Paste your existing listing title…"
            disabled={loadingAudit}
          />
        </div>

        <div>
          <label htmlFor="audit-desc" className="mb-1.5 block text-sm font-medium text-ink-700">
            Current description
          </label>
          <textarea
            id="audit-desc"
            className={`${fieldClasses} min-h-44 resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste your existing description…"
            disabled={loadingAudit}
          />
        </div>

        <div>
          <label htmlFor="audit-tags" className="mb-1.5 block text-sm font-medium text-ink-700">
            Current tags <span className="text-ink-400">(optional, comma-separated)</span>
          </label>
          <input
            id="audit-tags"
            className={fieldClasses}
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="candle, handmade gift, lavender"
            disabled={loadingAudit}
          />
        </div>

        {error ? (
          <div className="animate-scale-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={audit}
          disabled={loadingAudit}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {loadingAudit ? (
            <>
              <Spinner className="h-4 w-4" />
              Analyzing your listing…
            </>
          ) : (
            "Audit my listing"
          )}
        </button>

        <p className="text-center text-xs text-ink-400">
          {account?.plan === "free"
            ? "Free plan: 1 audit per month."
            : "Your plan includes monthly audits — use them anytime."}
        </p>
      </div>

      <div className="min-h-[480px] space-y-4">
        {!report && !loadingAudit ? (
          <div className="relative flex min-h-[480px] flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-dashed border-ink-300 bg-white/60 p-10 text-center">
            <div className="pointer-events-none absolute inset-0 bg-dots opacity-40" />
            <p className="relative text-4xl">🔍</p>
            <div className="relative">
              <p className="text-lg font-semibold text-ink-900">Your report appears here</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">
                Paste an existing listing and get a 0–100 score, specific issues,
                and a rewritten, optimized version.
              </p>
            </div>
          </div>
        ) : null}

        {loadingAudit ? (
          <div className="flex min-h-[480px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-ink-300 bg-white/60">
            <Spinner className="h-8 w-8 text-brand-600" />
            <p className="text-sm font-semibold text-ink-900">Scoring your listing…</p>
            <p className="text-xs text-ink-400">Checking keywords · Reading like a buyer · Comparing winners</p>
          </div>
        ) : null}

        {report ? (
          <>
            {/* Score card */}
            <section className="animate-scale-in rounded-3xl border border-ink-200/80 bg-white p-6 shadow-lg shadow-ink-900/5 sm:p-8">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
                <div className="relative h-32 w-32 shrink-0">
                  <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" className="stroke-ink-100" />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(report.score / 100) * 326.7} 326.7`}
                      className={scoreRing(report.score)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${scoreColor(report.score)}`}>
                      {report.score}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                      / 100
                    </span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${scoreColor(
                      report.score
                    ).replace("text-", "bg-").includes("green") ? "bg-green-50 text-green-700 ring-green-200" : scoreColor(report.score).includes("amber") ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-red-50 text-red-700 ring-red-200"}`}
                  >
                    {report.grade}
                  </span>
                  <p className="mt-3 text-base leading-relaxed text-ink-700">
                    {report.summary}
                  </p>
                </div>
              </div>
            </section>

            {/* Issues */}
            {report.issues.length ? (
              <section className="animate-fade-up rounded-3xl border border-ink-200/80 bg-white p-6 shadow-sm sm:p-8">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  What to fix
                </h3>
                <ul className="mt-4 space-y-4">
                  {report.issues.map((issue, i) => {
                    const style = SEVERITY_STYLES[issue.severity] ?? SEVERITY_STYLES.medium;
                    return (
                      <li
                        key={i}
                        className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${style.badge}`}>
                            {style.label}
                          </span>
                          <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-500 ring-1 ring-ink-200">
                            {issue.type}
                          </span>
                        </div>
                        <p className="mt-2.5 text-sm font-medium leading-relaxed text-ink-800">
                          {issue.message}
                        </p>
                        {issue.fix ? (
                          <p className="mt-1.5 flex gap-2 text-sm leading-relaxed text-ink-600">
                            <span className="mt-0.5 shrink-0 font-semibold text-brand-600">Fix:</span>
                            {issue.fix}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {/* Improved listing */}
            <div className="animate-fade-up rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 p-[1.5px]">
              <div className="rounded-2xl bg-white p-4 sm:p-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-600">
                  Your improved listing — ready to paste
                </h3>
                <ListingDisplay listing={report.improvedListing} compact={false} />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
