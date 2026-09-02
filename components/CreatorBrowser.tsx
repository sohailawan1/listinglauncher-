"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CreatorProfile } from "@/lib/store";

type CreatorWithStats = CreatorProfile & { rating: number; reviewCount: number };

const PLATFORM_META: Record<string, { label: string; color: string; bg: string }> = {
  tiktok: { label: "TikTok", color: "text-ink-900", bg: "bg-ink-900" },
  instagram: { label: "Instagram", color: "text-white", bg: "bg-gradient-to-br from-purple-500 to-pink-500" },
  youtube: { label: "YouTube", color: "text-white", bg: "bg-red-500" },
  other: { label: "Other", color: "text-ink-700", bg: "bg-ink-200" },
};

const PLATFORM_FILTERS = [
  { value: "all", label: "All platforms" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
];

export function CreatorBrowser() {
  const [creators, setCreators] = useState<CreatorWithStats[]>([]);
  const [niches, setNiches] = useState<string[]>([]);
  const [platform, setPlatform] = useState("all");
  const [niche, setNiche] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (platform !== "all") params.set("platform", platform);
    if (niche !== "all") params.set("niche", niche);
    if (search.trim()) params.set("q", search.trim());
    let active = true;
    fetch(`/api/creators?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setCreators(data.creators ?? []);
        setNiches(data.niches ?? []);
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [platform, niche, search]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      {/* Search row */}
      <div className="rounded-3xl border border-ink-200/80 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creators by name or niche…"
            className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
          />
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
          >
            {PLATFORM_FILTERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
          >
            <option value="all">All niches</option>
            {niches.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="mt-10 text-center text-sm text-ink-400">Loading creators…</div>
      ) : creators.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-ink-300 bg-white/60 p-10 text-center">
          <p className="text-lg font-semibold text-ink-900">No creators match those filters</p>
          <p className="mt-1 text-sm text-ink-500">
            Try widening the search, or{" "}
            <Link href="/creators/apply" className="font-semibold text-brand-600 underline">
              become a creator yourself
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((c) => (
            <CreatorCard key={c.id} creator={c} />
          ))}
        </div>
      )}

      <div className="mt-12 rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-50 to-brand-50 p-6 text-center shadow-sm sm:p-8">
        <p className="text-lg font-bold text-ink-900">Are you a creator?</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-600">
          Join our marketplace and earn money promoting products you love. Set
          your own rates, choose your own jobs.
        </p>
        <Link
          href="/creators/apply"
          className="mt-4 inline-flex rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-700"
        >
          Apply to join
        </Link>
      </div>
    </div>
  );
}

function CreatorCard({ creator }: { creator: CreatorWithStats }) {
  return (
    <Link
      href={`/creators/${creator.id}`}
      className="group flex flex-col rounded-3xl border border-ink-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-lg font-bold text-white shadow-md">
          {creator.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-900">{creator.name}</p>
          <p className="text-xs text-ink-400">
            {creator.platforms
              .map((p) => PLATFORM_META[p]?.label ?? p)
              .slice(0, 2)
              .join(" · ")}
            {creator.followers > 0 ? ` · ${formatFollowers(creator.followers)}` : ""}
          </p>
        </div>
        {creator.rating > 0 ? (
          <div className="ml-auto flex items-center gap-1 text-xs font-semibold text-ink-700">
            <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {creator.rating}
            <span className="text-ink-400">({creator.reviewCount})</span>
          </div>
        ) : null}
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-ink-600">{creator.bio}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {creator.niches.slice(0, 3).map((n) => (
          <span
            key={n}
            className="rounded-full bg-ink-100 px-2.5 py-0.5 text-[11px] font-medium text-ink-600"
          >
            {n}
          </span>
        ))}
      </div>
      <div className="mt-auto pt-4 flex items-center justify-between text-xs">
        <span className="font-semibold text-ink-900">
          ${creator.rateMin}+
          {creator.rateMax > creator.rateMin ? ` – $${creator.rateMax}` : ""} / promo
        </span>
        <span className="font-semibold text-brand-600 group-hover:underline">View profile →</span>
      </div>
    </Link>
  );
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M followers`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K followers`;
  return `${n} followers`;
}
