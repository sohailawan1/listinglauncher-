import Link from "next/link";
import { APP_NAME } from "@/lib/plans";

const productLinks = [
  { href: "/generate", label: "Listing Generator" },
  { href: "/audit", label: "Listing Audit" },
  { href: "/bulk", label: "Bulk Generator" },
  { href: "/influencers", label: "Creator Marketplace" },
  { href: "/library", label: "My Library" },
  { href: "/account", label: "My Account" },
];

const companyLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 font-semibold text-ink-900">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white shadow-md shadow-brand-500/30">
                LL
              </span>
              <span className="text-[15px]">{APP_NAME}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
              AI product listings that sell. Describe your product once and get a
              complete, search-optimized listing for Etsy, Amazon, Shopify, or eBay —
              in seconds.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-600 transition-colors hover:text-ink-900"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-600 transition-colors hover:text-ink-900"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:hello@listinglauncher.app"
                  className="text-sm text-ink-600 transition-colors hover:text-ink-900"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-200 pt-6 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p>Made for sellers, by sellers.</p>
        </div>
      </div>
    </footer>
  );
}
