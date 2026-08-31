"use client";

import { useState } from "react";
import Link from "next/link";
import { APP_NAME } from "@/lib/plans";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/audit", label: "Listing Audit" },
  { href: "/bulk", label: "Bulk" },
  { href: "/library", label: "Library" },
  { href: "/#pricing", label: "Pricing" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink-200/70 bg-ink-50/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-ink-900"
          onClick={() => setOpen(false)}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white shadow-md shadow-brand-500/30">
            LL
          </span>
          <span className="text-[15px]">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-600 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ink-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/generate"
            className="hidden rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-700 hover:shadow-lg sm:inline-flex"
          >
            Try it free
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-ink-300 text-ink-700 md:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {open ? (
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-ink-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/generate"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-ink-900 px-5 py-2.5 text-center text-sm font-semibold text-white"
            >
              Try it free
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
