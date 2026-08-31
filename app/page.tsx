import Link from "next/link";
import { plans } from "@/lib/plans";
import { CheckoutButton } from "@/components/CheckoutButton";

/* ----------------------- big marketplace brand cards ---------------------- */

const marketplaceCards = [
  {
    name: "Etsy",
    tagline: "13 perfect tags. Every single time.",
    detail: "Hand-poured titles under 140 characters, front-loaded with the exact keywords Etsy buyers search.",
    color: "#F1641E",
    gradient: "from-[#F1641E] to-[#D4531A]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden="true">
        <path d="M9.113 7.517v3.15h2.47c1.42 0 2.1-.94 2.1-1.58 0-.67-.66-1.57-2.06-1.57H9.113zm11.63 4.5c0 4.94-2.84 7.99-9.05 7.99H3.257a.99.99 0 01-.99-.99V4.09c0-.546.443-.99.99-.99h8.146c6.48 0 9.34 3.1 9.34 7.92zm-4.62-.17c0-2.87-2.42-4.28-4.71-4.28H7.19a.63.63 0 00-.63.63v11.35c0 .35.28.63.63.63h4.22c2.77 0 4.71-1.55 4.71-4.46 0-1.63-.85-2.83-1.9-3.3 1.15-.6 1.9-1.62 1.9-2.57z" />
      </svg>
    ),
  },
  {
    name: "Amazon",
    tagline: "Bullets that rank and convert.",
    detail: "FEATURE → BENEFIT bullet points, backend search terms, and titles built for Amazon's algorithm.",
    color: "#FF9900",
    gradient: "from-[#232F3E] to-[#131922]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden="true">
        <path d="M13.96 11.7c0 .86.09 1.42-.54 1.99-.93.86-2.89 1.5-4.34 1.24-1.4-.25-2.56-1.11-2.56-2.29 0-1.66 2.1-2.04 3.66-2.04 1.25 0 3.78.16 3.78 1.1zm-1.2-3.96c-.03-1.77-.34-3.16-2.03-3.16-1.63 0-2.17 1.32-2.24 2.74-.02.33-.02 1.02 0 1.35.09 1.32.62 2.6 2.24 2.6 1.7 0 2-1.55 2.03-3.03.02-.33.02-1.17 0-1.5zm7.24 6.34c0-2.15-1.74-3.72-4.48-3.72-2.73 0-4.5 1.57-4.5 3.72 0 2.14 1.77 3.65 4.5 3.65 2.74 0 4.48-1.51 4.48-3.65zm-2.22 0c0 1.1-.8 1.9-2.26 1.9-1.46 0-2.27-.8-2.27-1.9 0-1.1.81-1.95 2.27-1.95 1.46 0 2.26.85 2.26 1.95z" />
    </svg>
    ),
  },
  {
    name: "Shopify",
    tagline: "Your brand voice, written for you.",
    detail: "Story-driven descriptions that make a one-product store feel like a premium brand.",
    color: "#96BF48",
    gradient: "from-[#96BF48] to-[#5E8E2E]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden="true">
        <path d="M15.37 5.46c-.3 0-.63.05-1 .15l-1.16.3.02 1.16c0 .5-.06 1.02-.14 1.53-.1.6-.25 1.2-.47 1.77-.2.53-.44 1.04-.73 1.52-.28.46-.6.9-.95 1.3-.35.4-.73.77-1.14 1.1-.4.33-.83.62-1.28.87-.44.25-.9.46-1.37.63-.46.17-.94.3-1.42.38l-1.13.2.02 1.13c0 .4.02.8.07 1.2.05.4.13.8.24 1.18.1.38.24.75.4 1.1.16.35.36.68.6.98l.36.44.44-.36c.4-.33.83-.62 1.28-.87.44-.25.9-.46 1.37-.63.46-.17.94-.3 1.42-.38.48-.08.96-.12 1.44-.12.48 0 .96.04 1.44.12.48.08.96.21 1.42.38.47.17.93.38 1.37.63.45.25.88.54 1.28.87l.44.36.36-.44c.24-.3.44-.63.6-.98.16-.35.3-.72.4-1.1.11-.38.19-.78.24-1.18.05-.4.07-.8.07-1.2l.02-1.13-1.13-.2c-.48-.08-.96-.21-1.42-.38-.47-.17-.93-.38-1.37-.63-.45-.25-.88-.54-1.28-.87-.41-.33-.79-.7-1.14-1.1-.35-.4-.67-.84-.95-1.3-.29-.48-.53-.99-.73-1.52-.22-.57-.37-1.17-.47-1.77-.08-.51-.14-1.03-.14-1.53l.02-1.16-1.16-.3c-.37-.1-.7-.15-1-.15z" />
      </svg>
    ),
  },
  {
    name: "eBay",
    tagline: "80-character titles, zero wasted space.",
    detail: "Brand + item type + key attributes — every character earns its place in eBay search.",
    color: "#E53238",
    gradient: "from-[#E53238] to-[#A8282C]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden="true">
        <path d="M6.4 9.2c-1.9 0-3.6 1.4-3.6 3.9 0 2.5 1.6 3.9 3.7 3.9 1.4 0 2.6-.7 3-1.6l-1.5-.9c-.3.5-.8.9-1.5.9-1 0-1.7-.7-1.8-1.7h4.8c.1-.3.1-.6.1-.9 0-2.2-1.3-3.6-3.2-3.6zm-1.7 3c.1-.9.7-1.6 1.7-1.6.9 0 1.6.6 1.6 1.6H4.7zm6.3-4.8v1.9c-1.5.1-2.4.9-2.4 2.6 0 1.8 1 2.8 2.6 2.8h4.6v-7.3h-4.8zm-3.9-2.6c-.7 0-1.2.5-1.2 1.2s.5 1.2 1.2 1.2 1.2-.5 1.2-1.2-.5-1.2-1.2-1.2zm14.2 6.4c0-1.4-1-2.6-2.9-2.6-1.6 0-2.8.9-3.1 2.2-.3-1.3-1.5-2.2-3-2.2-1.9 0-2.9 1.2-2.9 2.6 0 1.7 1.2 2.9 3.1 2.9 1.4 0 2.4-.6 2.8-1.5.4.9 1.4 1.5 2.8 1.5 1.9 0 3.2-1.2 3.2-2.9zm-5.6-3.5h-2.3v5.4h2.3c1.9 0 3.1-1 3.1-2.7s-1.2-2.7-3.1-2.7z" />
      </svg>
    ),
  },
];

/* --------------------------------- data --------------------------------- */

const features = [
  {
    icon: "⚡",
    title: "Ready in seconds",
    body: "Describe your product once. Get a title, description, benefits, tags, and keywords before your coffee cools.",
    span: "sm:col-span-1",
  },
  {
    icon: "🎯",
    title: "Marketplace-tuned",
    body: "Each marketplace gets its own format — Etsy's 13 tags, Amazon's bullet style, eBay's 80-char titles.",
    span: "sm:col-span-1",
  },
  {
    icon: "🔍",
    title: "Listing Audit",
    body: "Paste an existing listing and get a 0–100 score, specific issues, and a rewritten version that ranks higher.",
    span: "sm:col-span-2",
    highlight: true,
  },
  {
    icon: "📚",
    title: "Your listing library",
    body: "Every listing saved to your account — searchable, reusable, never lost.",
    span: "sm:col-span-1",
  },
  {
    icon: "📊",
    title: "Bulk CSV mode",
    body: "Upload your whole catalog. Get optimized listings for every product — exported as CSV.",
    span: "sm:col-span-1",
  },
  {
    icon: "🌟",
    title: "Creator promotions",
    body: "Book niche TikTok, Instagram & YouTube creators to promote your listing. You approve, they post, you sell.",
    span: "sm:col-span-1",
  },
  {
    icon: "🎨",
    title: "5 selling tones",
    body: "Friendly, luxury, playful, minimal, or urgent — find the voice that converts your buyers.",
    span: "sm:col-span-1",
  },
  {
    icon: "🔒",
    title: "No lock-in",
    body: "Copy anything, anytime. Your listings are yours — cancel in one click.",
    span: "sm:col-span-1",
  },
];

const steps = [
  {
    step: "01",
    title: "Describe your product",
    body: "Enter your product name, marketplace, tone, and a few details that make it special.",
  },
  {
    step: "02",
    title: "AI writes the listing",
    body: "Our AI crafts a title, description, benefits, tags, and keywords in about 10 seconds.",
  },
  {
    step: "03",
    title: "Paste & publish",
    body: "Copy each section straight into Etsy, Amazon, or Shopify — no editing required.",
  },
];

const faqs = [
  {
    q: "Do I need any writing skills?",
    a: "No. You describe your product in plain words and the AI turns it into a polished, professional listing.",
  },
  {
    q: "Which marketplaces does it support?",
    a: "Etsy, Amazon, Shopify, and eBay. Each listing is formatted and optimized for the marketplace you choose — from Etsy's 13-tag limit to Amazon's bullet-point style.",
  },
  {
    q: "What is Listing Audit?",
    a: "Paste a listing you already have and get a 0–100 quality score, a list of specific issues holding it back, and a rewritten, optimized version ready to paste. It's like having a listing expert on call.",
  },
  {
    q: "How does the creator marketplace work?",
    a: "After generating a listing, request a promotion. Niche TikTok, Instagram, and YouTube creators whose audiences buy handmade and e-commerce products can pick it up. You set the budget, you approve the creator, and you keep 100% of the sales — ListingLauncher takes no cut.",
  },
  {
    q: "Is the free plan really free?",
    a: "Yes. You get 3 AI listings and 1 audit every month with no credit card. Upgrade only if you want more volume, bulk mode, and higher caps.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel in one click and you keep access until the end of your billing period.",
  },
];

const stats = [
  { value: "10s", label: "Average generation time" },
  { value: "4", label: "Marketplaces supported" },
  { value: "13", label: "Exact Etsy tags per listing" },
  { value: "0", label: "Writing skills required" },
];

function sampleDescription() {
  return [
    "Meet your new favorite candle. Hand-poured in small batches with 100% natural soy wax, this lavender candle burns cleanly for up to 50 hours — no soot, no synthetic fragrances, just a soft garden of calm for your home.",
    "Each candle is crafted with a hand-blended essential oil mix, a crackling wooden wick, and a reusable glass jar that looks beautiful on any shelf. It is the perfect companion for slow evenings, self-care rituals, or a thoughtful gift that shows you care.",
    "Treat yourself — or someone special — to a little everyday calm. Add this lavender candle to your cart and let your home do the talking.",
  ].join("\n\n");
}

export default function Home() {
  return (
    <main>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-200/60 via-amber-100/40 to-transparent blur-3xl" />
          <div className="absolute inset-0 bg-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              Now with Listing Audit + Creator Promotions
            </span>
          </div>

          <h1
            className="mx-auto mt-6 max-w-4xl animate-fade-up text-balance text-5xl font-bold leading-[1.05] tracking-tight text-ink-900 sm:text-7xl"
            style={{ animationDelay: "0.1s" }}
          >
            Write listings that{" "}
            <span className="relative whitespace-nowrap">
              <span className="bg-gradient-to-r from-brand-500 via-orange-500 to-brand-600 bg-clip-text text-transparent animate-gradient-pan">
                sell themselves
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 9C60 3 150 2 298 7"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-brand-300"
                />
              </svg>
            </span>
          </h1>

          <p
            className="mx-auto mt-8 max-w-xl animate-fade-up text-lg leading-relaxed text-ink-600 sm:text-xl"
            style={{ animationDelay: "0.2s" }}
          >
            Describe your product once. Get a complete, search-optimized listing —
            title, description, benefits, tags, and keywords — in seconds, not hours.
          </p>

          <div
            className="mt-10 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href="/generate"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-brand-500/40 sm:w-auto"
            >
              Write my first listing — free
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </Link>
            <Link
              href="#pricing"
              className="inline-flex w-full items-center justify-center rounded-full border border-ink-300 bg-white/80 px-8 py-4 text-sm font-semibold text-ink-800 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white sm:w-auto"
            >
              See pricing
            </Link>
          </div>

          <p className="mt-5 animate-fade-up text-xs text-ink-400" style={{ animationDelay: "0.4s" }}>
            Free forever plan · No credit card · 3 listings every month
          </p>
        </div>
      </section>

      {/* ============ BIG MARKETPLACE BRAND CARDS (top, premium) ============ */}
      <section className="border-y border-ink-200/70 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-ink-400">
            One tool · Built for every marketplace · Tuned to each algorithm
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {marketplaceCards.map((m) => (
              <Link
                key={m.name}
                href="/generate"
                className="group relative overflow-hidden rounded-3xl border border-ink-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink-900/10"
              >
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-[0.07] transition-all duration-500 group-hover:scale-150 group-hover:opacity-[0.12]"
                  style={{ backgroundColor: m.color }}
                />
                <span
                  className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${m.gradient} text-white shadow-lg`}
                  style={{ boxShadow: `0 8px 20px -6px ${m.color}66` }}
                >
                  {m.icon}
                </span>
                <h3 className="relative mt-4 text-lg font-bold text-ink-900">{m.name}</h3>
                <p className="relative mt-1 text-sm font-semibold" style={{ color: m.color }}>
                  {m.tagline}
                </p>
                <p className="relative mt-2 text-xs leading-relaxed text-ink-500">{m.detail}</p>
                <span className="relative mt-4 inline-flex items-center gap-1 text-xs font-semibold text-ink-400 transition-colors group-hover:text-ink-700">
                  Write a {m.name} listing
                  <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LIVE EXAMPLE ================= */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                See it in action
              </p>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                From one sentence to a complete listing
              </h2>
              <p className="mt-4 leading-relaxed text-ink-600">
                This entire listing — title, three paragraphs, benefits, tags, and
                keywords — was generated from a single line:{" "}
                <em className="rounded bg-brand-50 px-1.5 py-0.5 font-medium text-ink-800 not-italic">
                  “hand-poured soy candle, lavender”
                </em>
              </p>
              <div className="mt-6 flex gap-3">
                <Link
                  href="/generate"
                  className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-700"
                >
                  Try it with your product
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-100/80 to-amber-50/60 blur-2xl" />
              <div className="animate-float">
                <div className="overflow-hidden rounded-3xl border border-ink-200/80 bg-white shadow-2xl shadow-ink-900/10">
                  <div className="flex items-center gap-1.5 border-b border-ink-100 bg-ink-50/60 px-5 py-3">
                    <span className="h-3 w-3 rounded-full bg-red-300" />
                    <span className="h-3 w-3 rounded-full bg-amber-300" />
                    <span className="h-3 w-3 rounded-full bg-green-300" />
                    <span className="ml-3 text-xs font-medium text-ink-400">
                      listinglauncher.app/generate
                    </span>
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 text-[11px] font-semibold">
                      <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-700 ring-1 ring-brand-200">
                        Etsy
                      </span>
                      <span className="rounded-full bg-ink-100 px-2.5 py-1 text-ink-600">
                        😊 Friendly
                      </span>
                      <span className="ml-auto text-ink-300">just now</span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold leading-snug text-ink-900">
                      Soy Candle — 50 Hour Burn Time, Natural Soy Wax | Hand-Poured Calm
                    </h3>
                    <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-ink-600">
                      {sampleDescription()}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {["handmade candle", "home decor", "gift for her", "aromatherapy", "self care", "+8 more"].map(
                        (tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-ink-100 px-3 py-1 text-[11px] font-medium text-ink-600"
                          >
                            {tag}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES (bento) ================= */}
      <section id="features" className="scroll-mt-20 border-y border-ink-200/70 bg-gradient-to-b from-ink-100/60 to-ink-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Features
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-ink-900 sm:text-5xl">
              Everything you need to list faster
            </h2>
            <p className="mt-4 text-lg text-ink-600">
              Stop staring at a blank listing form. Turn your product into a polished,
              persuasive listing in under a minute.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className={`group relative overflow-hidden rounded-3xl border border-ink-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink-900/8 ${f.span} ${
                  f.highlight
                    ? "bg-gradient-to-br from-white to-brand-50/60 ring-1 ring-brand-200/60"
                    : ""
                }`}
              >
                {f.highlight ? (
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-200/40 blur-2xl" />
                ) : null}
                <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-amber-50 text-xl shadow-sm ring-1 ring-brand-100">
                  {f.icon}
                </span>
                <h3 className="relative mt-4 font-semibold text-ink-900">{f.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-ink-600">{f.body}</p>
                {f.highlight ? (
                  <Link
                    href="/audit"
                    className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
                  >
                    Try Listing Audit
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5" />
                    </svg>
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CREATOR MARKETPLACE ================= */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-purple-200/30 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs font-semibold text-purple-700">
                New — Creator Marketplace
              </span>
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                Your listing, promoted by creators whose audiences buy
              </h2>
              <p className="mt-4 leading-relaxed text-ink-600">
                A great listing is step one. Step two: put it in front of buyers.
                Book niche TikTok, Instagram, and YouTube creators to showcase your
                product — you approve every creator, you set the budget, and you
                keep 100% of every sale.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Niche audiences: handmade, home decor, gadgets, gifts",
                  "Pay per post — starting at $5, no agency fees",
                  "You approve the creator before they post",
                  "ListingLauncher takes 0% of your deal",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-ink-700">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-purple-50 text-purple-600 ring-1 ring-purple-200">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href="/influencers"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-700"
              >
                Explore creators
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5" />
                </svg>
              </Link>
            </div>

            <div className="grid gap-4">
              {[
                {
                  name: "Handmade with Holly",
                  platform: "TikTok · 84K",
                  line: "“Etsy sellers — this candle listing wrote itself in 10 seconds.”",
                  accent: "from-ink-900 to-ink-700",
                  initial: "H",
                },
                {
                  name: "The Seller Desk",
                  platform: "YouTube · 31K",
                  line: "“Audit scored my listing 41/100. The rewrite doubled my clicks.”",
                  accent: "from-red-500 to-red-700",
                  initial: "S",
                },
                {
                  name: "Cozy Cottage Interiors",
                  platform: "Instagram · 120K",
                  line: "“My audience asks where I find these products. Now I feature yours.”",
                  accent: "from-purple-500 to-purple-700",
                  initial: "C",
                },
              ].map((inf) => (
                <div
                  key={inf.name}
                  className="flex items-center gap-4 rounded-3xl border border-ink-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${inf.accent} text-lg font-bold text-white`}
                  >
                    {inf.initial}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900">
                      {inf.name} <span className="font-normal text-ink-400">· {inf.platform}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-ink-600">{inf.line}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-ink-200/70 bg-gradient-to-b from-ink-100/60 to-ink-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              How it works
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-ink-900 sm:text-5xl">
              From idea to listing in 3 steps
            </h2>
          </div>

          <div className="relative mt-16 grid gap-6 md:grid-cols-3">
            <div className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent md:block" />
            {steps.map((s) => (
              <div key={s.step} className="relative">
                <div className="flex items-center gap-4 md:flex-col md:items-start">
                  <span className="relative z-10 inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 text-2xl font-bold text-white shadow-lg shadow-brand-500/30">
                    {s.step}
                  </span>
                  <div className="md:mt-6">
                    <h3 className="text-lg font-semibold text-ink-900">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section
        id="pricing"
        className="scroll-mt-20 relative overflow-hidden py-20 sm:py-28"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-72 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-200/30 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Pricing
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-ink-900 sm:text-5xl">
              Simple pricing that pays for itself
            </h2>
            <p className="mt-4 text-lg text-ink-600">
              A single sale from a better listing covers your whole year.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlighted
                    ? "border-2 border-brand-500 bg-white shadow-2xl shadow-brand-500/15"
                    : "border border-ink-200/80 bg-white shadow-sm hover:shadow-lg"
                }`}
              >
                {plan.badge ? (
                  <span
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-xs font-bold text-white shadow-md ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-brand-500 to-brand-600"
                        : "bg-ink-900"
                    }`}
                  >
                    {plan.badge}
                  </span>
                ) : null}

                <h3 className="text-lg font-semibold text-ink-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-ink-500">{plan.tagline}</p>
                <p className="mt-5 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight text-ink-900">
                    {plan.priceLabel}
                  </span>
                  <span className="text-sm text-ink-500">/ month</span>
                </p>
                <p className="mt-1 text-sm font-medium text-brand-600">{plan.creditsLabel}</p>

                <ul className="mt-7 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink-700">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-200">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <CheckoutButton
                    plan={plan.id}
                    label={plan.cta}
                    variant={plan.highlighted ? "primary" : plan.id === "business" ? "dark" : "outline"}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-ink-500">
            All plans include every marketplace format · Cancel anytime · 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="scroll-mt-20 border-t border-ink-200/70 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">FAQ</p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-ink-900 sm:text-5xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="mt-12 space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-ink-200/80 bg-white px-6 py-5 shadow-sm transition-shadow open:shadow-md"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-500 transition-all group-open:rotate-45 group-open:bg-brand-100 group-open:text-brand-700">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative overflow-hidden bg-ink-950 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-96 w-[800px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]" />
          <div className="absolute inset-0 bg-grid opacity-[0.15] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Stop guessing. <span className="bg-gradient-to-r from-brand-400 to-amber-300 bg-clip-text text-transparent">Start selling.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-300">
            Write your first professional product listing right now — it is free
            and takes less than a minute.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/generate"
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-8 py-4 text-sm font-semibold text-white shadow-2xl shadow-brand-500/40 transition-all hover:-translate-y-0.5 sm:w-auto"
            >
              Generate my first listing
            </Link>
            <Link
              href="/audit"
              className="inline-flex w-full items-center justify-center rounded-full border border-ink-700 bg-ink-900/80 px-8 py-4 text-sm font-semibold text-ink-100 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-ink-500 sm:w-auto"
            >
              Score my current listing
            </Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold tracking-tight text-white">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-ink-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
