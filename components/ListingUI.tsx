"use client";

import { useState } from "react";
import type { GeneratedListing } from "@/lib/types";

export function CopyButton({
  text,
  label,
  className = "",
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 transition-all hover:-translate-y-0.5 hover:bg-ink-100 ${className}`}
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy {label}
        </>
      )}
    </button>
  );
}

export function SectionCard({
  title,
  children,
  extra,
  accent = false,
}: {
  title: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <section className="animate-fade-up rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3
          className={`text-xs font-semibold uppercase tracking-wider ${accent ? "text-brand-600" : "text-ink-400"}`}
        >
          {title}
        </h3>
        {extra}
      </div>
      {children}
    </section>
  );
}

export function TagsRow({ tags, accent = false }: { tags: string[]; accent?: boolean }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span
          key={i}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            accent
              ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
              : "bg-ink-100 text-ink-700"
          }`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export function BulletsList({ points }: { points: string[] }) {
  if (!points.length) return null;
  return (
    <ul className="space-y-2.5">
      {points.map((point, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink-700">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-brand-400 to-brand-600" />
          {point}
        </li>
      ))}
    </ul>
  );
}

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export function ListingDisplay({
  listing,
  compact = false,
}: {
  listing: GeneratedListing;
  compact?: boolean;
}) {
  return (
    <div className="space-y-4">
      <SectionCard
        title="Title"
        extra={<CopyButton text={listing.title} label="title" />}
      >
        <p className="text-base font-medium leading-relaxed text-ink-900">
          {listing.title}
        </p>
        <p className="mt-2 text-xs text-ink-400">Short: {listing.shortTitle}</p>
      </SectionCard>

      {!compact ? (
        <SectionCard
          title="Description"
          extra={<CopyButton text={listing.description} label="description" />}
        >
          <div className="whitespace-pre-line text-sm leading-relaxed text-ink-700">
            {listing.description}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Key benefits"
        extra={<CopyButton text={listing.bulletPoints.join("\n")} label="bullets" />}
      >
        <BulletsList points={listing.bulletPoints} />
      </SectionCard>

      <SectionCard title="Tags" extra={<CopyButton text={listing.tags.join(", ")} label="tags" />}>
        <TagsRow tags={listing.tags} />
      </SectionCard>

      <SectionCard
        title="Search keywords"
        extra={<CopyButton text={listing.keywords.join(", ")} label="keywords" />}
      >
        <TagsRow tags={listing.keywords} accent />
      </SectionCard>
    </div>
  );
}
