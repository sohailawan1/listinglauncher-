import type { Metadata } from "next";
import { Auditor } from "@/components/Auditor";

export const metadata: Metadata = {
  title: "Listing Audit — Score & Optimize",
  description:
    "Paste an existing product listing and get a 0–100 quality score, specific issues to fix, and an AI-rewritten optimized version.",
};

export default function AuditPage() {
  return (
    <main className="relative py-10 sm:py-14">
      <div className="mx-auto mb-10 max-w-6xl px-4 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700">
          New — Listing Audit
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Score your listing. Beat your competitors.
        </h1>
        <p className="mt-2 max-w-2xl text-ink-600">
          Find out exactly why your listing isn&apos;t ranking — and get a
          rewritten, search-optimized version ready to paste.
        </p>
      </div>
      <Auditor />
    </main>
  );
}
