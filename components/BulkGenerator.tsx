"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { GeneratedListing, Marketplace, Tone } from "@/lib/types";
import { formatBulkCsv } from "@/lib/library";
import { Spinner } from "@/components/ListingUI";
import { isProUsage, useUsage } from "@/lib/usage";

const fieldClasses =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

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

type Row = { productName: string; details: string };

function parseCsv(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];

  const splitLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };

  const header = splitLine(lines[0]).map((h) => h.toLowerCase());
  const nameIdx = header.findIndex((h) => h.includes("product") || h.includes("name") || h.includes("title"));
  const detailIdx = header.findIndex((h) => h.includes("detail") || h.includes("description"));

  const rows: Row[] = [];
  for (const line of lines.slice(1)) {
    const cols = splitLine(line);
    const productName = (nameIdx >= 0 ? cols[nameIdx] : cols[0]) ?? "";
    const details = (detailIdx >= 0 ? cols[detailIdx] : cols[1]) ?? "";
    if (productName) rows.push({ productName, details });
  }
  return rows;
}

export function BulkGenerator() {
  const usage = useUsage();
  const isPro = isProUsage(usage);

  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [marketplace, setMarketplace] = useState<Marketplace>("etsy");
  const [tone, setTone] = useState<Tone>("friendly");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<GeneratedListing[]>([]);
  const [failedRows, setFailedRows] = useState<{ productName: string; error: string }[]>([]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseCsv(String(reader.result ?? ""));
      if (!parsed.length) {
        setError("No product rows found. The CSV needs a header row and at least one product.");
        setRows([]);
        return;
      }
      setRows(parsed.slice(0, 50));
    };
    reader.readAsText(file);
  }

  async function run() {
    if (!rows.length) {
      setError("Upload a CSV first.");
      return;
    }

    setLoading(true);
    setError(null);
    setListings([]);
    setFailedRows([]);
    setProgress(10);

    const timer = setInterval(() => {
      setProgress((p) => Math.min(90, p + Math.ceil(80 / rows.length)));
    }, 1500);

    try {
      const res = await fetch("/api/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, marketplace, tone }),
      });
      const data = (await res.json()) as {
        listings?: GeneratedListing[];
        failed?: { productName: string; error: string }[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Bulk generation failed. Please try again.");
        return;
      }
      setListings(data.listings ?? []);
      setFailedRows(data.failed ?? []);
      setProgress(100);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }

  function downloadCsv() {
    const csv = formatBulkCsv(listings);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "listinglauncher-bulk.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
      {!isPro ? (
        <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-brand-50 p-5 sm:flex-row sm:items-center">
          <p className="text-sm text-purple-800">
            <span className="font-semibold">Bulk generation is a Pro feature.</span>{" "}
            You can preview it with up to 3 products right now.
          </p>
          <Link
            href="/#pricing"
            className="shrink-0 rounded-full bg-purple-700 px-4 py-2 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-800"
          >
            Go Pro
          </Link>
        </div>
      ) : null}

      <div className="space-y-5 rounded-3xl border border-ink-200/80 bg-white p-6 shadow-lg shadow-ink-900/5 sm:p-8">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">1. Upload your products</h2>
          <p className="mt-1 text-sm text-ink-500">
            A CSV with columns <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">product_name</code> and
            optionally <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">details</code>. One product per row.
          </p>
          <label
            className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-300 bg-ink-50/50 px-6 py-10 text-center transition-all hover:border-brand-400 hover:bg-brand-50/40"
          >
            <svg className="h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.9A5 5 0 1115.9 6H16a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm font-semibold text-ink-800">
              {rows.length ? `${rows.length} products loaded` : "Click to choose a CSV file"}
            </span>
            <span className="text-xs text-ink-400">or drag &amp; drop · max 50 rows on this plan</span>
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bulk-marketplace" className="mb-1.5 block text-sm font-medium text-ink-700">
              Marketplace
            </label>
            <select
              id="bulk-marketplace"
              className={fieldClasses}
              value={marketplace}
              onChange={(e) => setMarketplace(e.target.value as Marketplace)}
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
            <label htmlFor="bulk-tone" className="mb-1.5 block text-sm font-medium text-ink-700">
              Tone
            </label>
            <select
              id="bulk-tone"
              className={fieldClasses}
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
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

        {error ? (
          <div className="animate-scale-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {rows.length ? (
          <div className="max-h-44 overflow-y-auto rounded-xl border border-ink-200 bg-ink-50/50 p-3">
            <ul className="space-y-1 text-xs text-ink-600">
              {rows.slice(0, 8).map((r, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span className="truncate font-medium text-ink-800">{r.productName}</span>
                  {r.details ? <span className="truncate text-ink-400">{r.details}</span> : null}
                </li>
              ))}
              {rows.length > 8 ? <li className="text-ink-400">+ {rows.length - 8} more…</li> : null}
            </ul>
          </div>
        ) : null}

        <button
          type="button"
          onClick={run}
          disabled={loading || !rows.length}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <Spinner className="h-4 w-4" />
              Generating {rows.length} listings…
            </>
          ) : (
            `Generate ${rows.length || ""} listings`
          )}
        </button>

        {loading ? (
          <div className="h-2 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </div>

      {listings.length ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-ink-900">
              ✅ {listings.length} listing{listings.length === 1 ? "" : "s"} ready
              {failedRows.length ? <span className="font-normal text-red-500"> · {failedRows.length} failed</span> : null}
            </p>
            <button
              type="button"
              onClick={downloadCsv}
              className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download CSV
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {listings.map((l, i) => (
              <div key={i} className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-ink-900">{l.title}</p>
                <p className="mt-1.5 line-clamp-2 text-xs text-ink-500">{l.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {l.tags.slice(0, 4).map((t, j) => (
                    <span key={j} className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-600">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
