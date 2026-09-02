import type { Metadata } from "next";
import { CreatorApplyForm } from "@/components/CreatorApplyForm";

export const metadata: Metadata = {
  title: "Apply to be a Creator",
  description: "Join our creator marketplace and earn money promoting products you love.",
};

export default function ApplyPage() {
  return (
    <main className="py-10 sm:py-14">
      <div className="mx-auto mb-10 max-w-2xl px-4 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs font-semibold text-purple-700">
          Creator Application
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Get paid to promote products you love
        </h1>
        <p className="mt-2 text-ink-600">
          We review every application within 3 days. Once approved, set up
          payouts and start receiving bookings.
        </p>
      </div>
      <CreatorApplyForm />
    </main>
  );
}
