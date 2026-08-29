import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} ListingLauncher. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/#pricing" className="transition-colors hover:text-stone-900">
            Pricing
          </Link>
          <Link href="/generate" className="transition-colors hover:text-stone-900">
            Generator
          </Link>
          <Link href="mailto:hello@listinglauncher.app" className="transition-colors hover:text-stone-900">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}