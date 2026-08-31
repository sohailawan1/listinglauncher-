import type { Metadata } from "next";
import { LibraryBrowser } from "@/components/LibraryBrowser";

export const metadata: Metadata = {
  title: "My Library",
  description:
    "Every listing you generate is saved here — searchable, copyable, and ready whenever you need it.",
};

export default function LibraryPage() {
  return (
    <main className="relative py-10 sm:py-14">
      <div className="mx-auto mb-10 max-w-5xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          My library
        </h1>
        <p className="mt-2 max-w-2xl text-ink-600">
          Every listing you generate is saved here automatically. Search, copy,
          and reuse whenever you list a new product.
        </p>
      </div>
      <LibraryBrowser />
    </main>
  );
}
