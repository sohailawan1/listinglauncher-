import type { Metadata } from "next";
import { AffiliateDashboard } from "@/components/AffiliateDashboard";

export const metadata: Metadata = {
  title: "Affiliate Program — 30% Recurring",
  description: "Earn 30% recurring commission for 12 months for every seller you refer to ListingLauncher.",
};

export default function AffiliatePage() {
  return (
    <main className="py-10 sm:py-14">
      <div className="mx-auto mb-10 max-w-4xl px-4 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700">
          Affiliate Program
        </span>
      </div>
      <AffiliateDashboard />
    </main>
  );
}
