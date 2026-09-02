import type { Metadata } from "next";
import { CreatorProfileView } from "@/components/CreatorProfileView";

export const metadata: Metadata = {
  title: "Creator Profile",
  description: "View a creator's profile, rates, reviews, and book them to promote your product.",
};

export default async function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="relative py-10 sm:py-14">
      <CreatorProfileView id={id} />
    </main>
  );
}
