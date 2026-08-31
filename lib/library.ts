import { useSyncExternalStore } from "react";
import type { GeneratedListing, Marketplace, Tone } from "@/lib/types";

export const LIBRARY_KEY = "ll_library_v1";

export type LibraryItem = {
  id: string;
  createdAt: number;
  productName: string;
  marketplace: Marketplace;
  tone: Tone;
  listing: GeneratedListing;
};

const EMPTY: LibraryItem[] = [];

function readAll(): LibraryItem[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(LIBRARY_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as LibraryItem[];
    return Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeAll(items: LibraryItem[]): void {
  try {
    window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(items));
  } catch {
    // storage full or unavailable; non-fatal
  }
}

const listeners = new Set<() => void>();
let cache: LibraryItem[] | null = null;

function getSnapshot(): LibraryItem[] {
  if (cache === null) cache = readAll();
  return cache;
}

function getServerSnapshot(): LibraryItem[] {
  return EMPTY;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  cache = null;
  listeners.forEach((l) => l());
}

export function useLibrary(): LibraryItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function addToLibrary(args: {
  productName: string;
  marketplace: Marketplace;
  tone: Tone;
  listing: GeneratedListing;
}): void {
  const item: LibraryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
    productName: args.productName,
    marketplace: args.marketplace,
    tone: args.tone,
    listing: args.listing,
  };
  const items = readAll();
  items.unshift(item);
  writeAll(items.slice(0, 200));
  emit();
}

export function removeFromLibrary(id: string): void {
  writeAll(readAll().filter((i) => i.id !== id));
  emit();
}

export function clearLibrary(): void {
  writeAll([]);
  emit();
}

export function formatBulkCsv(items: GeneratedListing[]): string {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const header = "title,short_title,description,bullets,tags,keywords";
  const rows = items.map((l) =>
    [
      esc(l.title),
      esc(l.shortTitle),
      esc(l.description),
      esc(l.bulletPoints.join(" | ")),
      esc(l.tags.join(", ")),
      esc(l.keywords.join(", ")),
    ].join(",")
  );
  return [header, ...rows].join("\n");
}
