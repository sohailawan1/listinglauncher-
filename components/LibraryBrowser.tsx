"use client";

import { useState } from "react";
import type { LibraryItem } from "@/lib/library";
import { clearLibrary, removeFromLibrary, useLibrary } from "@/lib/library";
import { CopyButton } from "@/components/ListingUI";
import Link from "next/link";

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ItemCard({ item, onDelete }: { item: LibraryItem; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="animate-fade-up rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">{item.productName}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-ink-400">
            <span className="rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-700 ring-1 ring-brand-200">
              {item.marketplace}
            </span>
            <span className="rounded-full bg-ink-100 px-2 py-0.5 font-medium text-ink-600">
              {item.tone}
            </span>
            <span>{formatDate(item.createdAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <CopyButton
            text={`${item.listing.title}\n\n${item.listing.description}\n\n${item.listing.bulletPoints.join("\n")}\n\nTags: ${item.listing.tags.join(", ")}\nKeywords: ${item.listing.keywords.join(", ")}`}
            label="all"
          />
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label="Delete listing"
            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-200 text-ink-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm font-medium leading-relaxed text-ink-800">{item.listing.title}</p>
      <p className={`mt-1.5 text-xs leading-relaxed text-ink-500 ${expanded ? "" : "line-clamp-2"}`}>
        {item.listing.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {item.listing.tags.slice(0, expanded ? 99 : 5).map((t, i) => (
          <span key={i} className="rounded-full bg-ink-100 px-2.5 py-0.5 text-[10px] font-medium text-ink-600">
            {t}
          </span>
        ))}
        {item.listing.tags.length > 5 && !expanded ? (
          <span className="text-[10px] text-ink-400">+{item.listing.tags.length - 5} more</span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
      >
        {expanded ? "Show less" : "View full listing"}
      </button>
    </div>
  );
}

export function LibraryBrowser() {
  const items = useLibrary();
  const [query, setQuery] = useState("");

  function handleDelete(id: string) {
    removeFromLibrary(id);
  }

  function handleClear() {
    clearLibrary();
  }

  const filtered = items.filter(
    (i) =>
      i.productName.toLowerCase().includes(query.toLowerCase()) ||
      i.listing.title.toLowerCase().includes(query.toLowerCase()) ||
      i.listing.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      {items.length ? (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your listings…"
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm transition-all placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 sm:max-w-xs"
          />
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 self-end rounded-lg border border-ink-200 px-3.5 py-2 text-xs font-medium text-ink-500 transition-colors hover:border-red-200 hover:text-red-600 sm:self-auto"
          >
            Clear library
          </button>
        </div>
      ) : null}

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      ) : items.length ? (
        <p className="py-20 text-center text-sm text-ink-400">No listings match “{query}”.</p>
      ) : (
        <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-dashed border-ink-300 bg-white/60 py-20 text-center">
          <div className="pointer-events-none absolute inset-0 bg-dots opacity-40" />
          <p className="relative text-4xl">📚</p>
          <div className="relative">
            <p className="text-lg font-semibold text-ink-900">Your library is empty</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">
              Every listing you generate is saved here automatically — on this device.
            </p>
            <Link
              href="/generate"
              className="mt-6 inline-flex rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5"
            >
              Write your first listing
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
