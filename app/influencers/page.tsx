import type { Metadata } from "next";
import { InfluencerMarketplace } from "@/components/InfluencerMarketplace";

export const metadata: Metadata = {
  title: "Influencer Marketplace",
  description:
    "Get your AI-generated listings promoted by niche creators on TikTok, Instagram, and YouTube. You approve every creator and keep 100% of sales.",
};

export default function InfluencerPage() {
  return (
    <main className="relative py-10 sm:py-14">
      <div className="mx-auto mb-10 max-w-6xl px-4 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700">
          New — Creator Marketplace
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Your listing, promoted by real creators
        </h1>
        <p className="mt-2 max-w-2xl text-ink-600">
          You write a great listing in seconds — now get it seen. Connect with
          niche influencers whose audiences actually buy handmade and
          e-commerce products.
        </p>
      </div>
      <InfluencerMarketplace />
    </main>
  );
}
