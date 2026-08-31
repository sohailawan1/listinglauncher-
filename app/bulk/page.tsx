import type { Metadata } from "next";
import { BulkGenerator } from "@/components/BulkGenerator";

export const metadata: Metadata = {
  title: "Bulk Listing Generator",
  description:
    "Upload a CSV of products and get complete, optimized listings for every row — titles, descriptions, bullets, tags, and keywords.",
};

export default function BulkPage() {
  return (
    <main className="relative py-10 sm:py-14">
      <div className="mx-auto mb-10 max-w-4xl px-4 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700">
          Pro feature
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Bulk listing generator
        </h1>
        <p className="mt-2 max-w-2xl text-ink-600">
          Upload your whole catalog once. Get marketplace-ready listings for every
          product — downloadable as CSV.
        </p>
      </div>
      <BulkGenerator />
    </main>
  );
}
