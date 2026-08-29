import { plans } from "@/lib/plans";
import { CheckoutButton } from "@/components/CheckoutButton";

const features = [
  {
    title: "Titles that get clicked",
    body: "Search-optimized titles under 140 characters, plus a short punchy variant for social posts.",
  },
  {
    title: "Descriptions that sell",
    body: "Three persuasive paragraphs with a hook, benefits, and a soft close that invites purchase.",
  },
  {
    title: "SEO built in",
    body: "Keywords and marketplace tags generated automatically from your product details.",
  },
  {
    title: "Built for every marketplace",
    body: "Formatting tuned for Etsy, Amazon, Shopify, and eBay — paste and publish in seconds.",
  },
  {
    title: "Ready in seconds",
    body: "No writing skills needed. Describe your product once and get a professional listing instantly.",
  },
  {
    title: "Endless variations",
    body: "Five writing tones — friendly, luxury, playful, minimal, urgent — find the voice that converts.",
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
    a: "Etsy, Amazon, Shopify, and eBay. Each listing is formatted and optimized for the marketplace you choose.",
  },
  {
    q: "Is the free plan really free?",
    a: "Yes. You get 3 AI listings every month with no credit card. Upgrade to Pro only if you want unlimited.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel in one click and you keep Pro access until the end of your billing period.",
  },
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
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-semibold text-orange-700">
            AI product listings for Etsy, Amazon & Shopify
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl">
            Write listings that <span className="text-orange-600">sell themselves</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
            Describe your product once. Get a complete, search-optimized listing with title,
            description, benefits, tags, and keywords — in seconds, not hours.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/generate"
              className="inline-flex w-full items-center justify-center rounded-full bg-orange-600 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 sm:w-auto"
            >
              Write my first listing — free
            </a>
            <a
              href="#pricing"
              className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white px-8 py-3.5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100 sm:w-auto"
            >
              See pricing
            </a>
          </div>
          <p className="mt-4 text-xs text-stone-400">
            Free forever plan available. No credit card required.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-stone-200 bg-white p-8 shadow-lg sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
            Live example
          </p>
          <h2 className="mt-4 text-xl font-bold text-stone-900">
            Soy Candle — 50 Hour Burn Time, Natural Soy Wax | Hand-Poured Calm
          </h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-stone-600">
            {sampleDescription()}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["handmade candle", "home decor", "gift for her", "aromatherapy", "self care"].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 bg-stone-100 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Everything you need to list faster
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              Stop staring at a blank listing form. Turn your product into a polished,
              persuasive listing in under a minute.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <h3 className="font-semibold text-stone-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              From idea to listing in 3 steps
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="rounded-2xl border border-stone-200 bg-white p-6">
                <span className="text-sm font-bold text-orange-600">{s.step}</span>
                <h3 className="mt-3 font-semibold text-stone-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-20 bg-stone-100 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Simple pricing that pays for itself
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              A single sale from a better listing covers your whole year.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-3xl gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={
                  plan.highlighted
                    ? "relative rounded-3xl border-2 border-orange-600 bg-white p-8 shadow-xl"
                    : "rounded-3xl border border-stone-200 bg-white p-8 shadow-sm"
                }
              >
                {plan.highlighted ? (
                  <span className="absolute -top-3 left-8 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white">
                    Most popular
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold text-stone-900">{plan.name}</h3>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-stone-900">{plan.priceLabel}</span>
                  <span className="text-sm text-stone-500">/ month</span>
                </p>
                <p className="mt-1 text-sm font-medium text-orange-600">{plan.creditsLabel}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-stone-700">
                      <span className="mt-0.5 text-orange-600">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <CheckoutButton plan={plan.id} label={plan.cta} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-stone-900">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-4">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-stone-200 bg-white p-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-stone-900">
                  {f.q}
                  <span className="text-stone-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Stop guessing. Start selling.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-stone-300">
            Write your first professional product listing right now - it is free and takes
            less than a minute.
          </p>
          <a
            href="/generate"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-orange-600 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
          >
            Generate my first listing
          </a>
        </div>
      </section>
    </main>
  );
}