import type { Metadata } from "next";
import { CreatorBrowser } from "@/components/CreatorBrowser";

export const metadata: Metadata = {
  title: "Creator Marketplace — Hire Niche Creators",
  description:
    "Browse vetted TikTok, Instagram, and YouTube creators who promote e-commerce products. Set your budget, hire in a click, pay only when delivered.",
};

export default function CreatorsPage() {
  return (
    <main className="relative py-10 sm:py-14">
      <div className="mx-auto mb-10 max-w-6xl px-4 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700">
          Creator Marketplace
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Hire a creator to promote your listing
        </h1>
        <p className="mt-2 max-w-2xl text-ink-600">
          Vetted TikTok, Instagram, and YouTube creators in your niche. You set
          the budget, you approve the work, and you pay only when delivered.
        </p>
      </div>
      <CreatorBrowser />
    </main>
  );
}
