import type { Metadata } from "next";
import { PitchKit } from "@/components/PitchKit";

export const metadata: Metadata = {
  title: "Creator Outreach Kit",
  description: "Ready-to-send outreach scripts for YouTube, TikTok, Instagram, Reddit, and email. Get creators promoting ListingLauncher.",
  robots: { index: false, follow: false },
};

export default function PitchPage() {
  return (
    <main className="relative py-10 sm:py-14">
      <div className="mx-auto mb-10 max-w-4xl px-4 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700">
          Growth Kit
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Outreach scripts that actually work
        </h1>
        <p className="mt-2 max-w-2xl text-ink-600">
          Copy-paste templates for getting creators, YouTubers, and communities
          to talk about ListingLauncher. Personalize the brackets and send.
        </p>
      </div>
      <PitchKit />
    </main>
  );
}
