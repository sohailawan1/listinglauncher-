import type { Metadata } from "next";
import { Generator } from "@/components/Generator";

export const metadata: Metadata = {
  title: "Listing Generator",
  description:
    "Generate a professional Etsy, Amazon, Shopify, or eBay product listing in seconds.",
};

export default function GeneratePage() {
  return (
    <main className="relative py-10 sm:py-14">
      <div className="mx-auto mb-10 max-w-6xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Listing generator
        </h1>
        <p className="mt-2 max-w-2xl text-ink-600">
          Describe your product once. Get a complete, ready-to-paste listing —
          saved to your library automatically.
        </p>
      </div>
      <Generator />
    </main>
  );
}
