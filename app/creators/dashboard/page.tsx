import type { Metadata } from "next";
import { CreatorDashboard } from "@/components/CreatorDashboard";

export const metadata: Metadata = {
  title: "Creator Dashboard",
  description: "Manage your creator profile, payouts, and bookings.",
};

export default function CreatorDashboardPage() {
  return (
    <main className="py-10 sm:py-14">
      <CreatorDashboard />
    </main>
  );
}
