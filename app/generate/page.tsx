import type { Metadata } from "next";
import { Generator } from "@/components/Generator";

export const metadata: Metadata = {
  title: "Listing Generator — ListingLauncher",
  description:
    "Generate a professional Etsy, Amazon, Shopify, or eBay product listing in seconds.",
};

export default function GeneratePage() {
  return (
    <main className="py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Listing generator
          </h1>
          <p className="mt-2 text-stone-600">
            Describe your product below and get a complete, ready-to-paste listing.
          </p>
        </div>
        <Generator />
      </div>
    </main>
  );
}