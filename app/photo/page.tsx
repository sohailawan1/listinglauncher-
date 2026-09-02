import type { Metadata } from "next";
import { PhotoTool } from "@/components/PhotoTool";

export const metadata: Metadata = {
  title: "AI Photo Studio",
  description:
    "Remove backgrounds and generate lifestyle product scenes with AI. Perfect for Etsy, Amazon, and Shopify listings.",
};

export default function PhotoPage() {
  return (
    <main className="relative py-10 sm:py-14">
      <div className="mx-auto mb-10 max-w-5xl px-4 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700">
          New — AI Photo Studio
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          One photo, every product shot you need
        </h1>
        <p className="mt-2 max-w-2xl text-ink-600">
          Snap a phone photo of your product → get a clean white-background
          shot and lifestyle scenes for every channel. AI does the work, you
          keep the clicks.
        </p>
      </div>
      <PhotoTool />
    </main>
  );
}
