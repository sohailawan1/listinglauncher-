import type { Metadata } from "next";
import { AccountView } from "@/components/AccountView";

export const metadata: Metadata = {
  title: "My Account",
  description: "Sign in or create your free ListingLauncher account.",
};

export default function AccountPage() {
  return (
    <main className="py-12 sm:py-16">
      <AccountView />
    </main>
  );
}
