import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Listing Tips, SEO & Growth",
  description: "Practical guides for Etsy, Amazon, Shopify, and eBay sellers. Tested patterns, real numbers.",
};

export default function BlogIndex() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700">
        Blog
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
        Listing tips that actually move the needle
      </h1>
      <p className="mt-2 max-w-2xl text-ink-600">
        Tested patterns, real numbers, and platform-specific playbooks for Etsy,
        Amazon, Shopify, and eBay sellers.
      </p>

      <div className="mt-10 space-y-4">
        {blogPosts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="block rounded-3xl border border-ink-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700">
              {p.category}
            </span>
            <h2 className="mt-3 text-lg font-bold text-ink-900">{p.title}</h2>
            <p className="mt-1 text-sm text-ink-600">{p.description}</p>
            <p className="mt-3 text-xs text-ink-400">
              {new Date(p.publishedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              · {p.readMinutes} min read
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
