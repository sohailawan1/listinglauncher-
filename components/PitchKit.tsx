"use client";

import { useState } from "react";
import Link from "next/link";

type Channel = "youtube" | "tiktok" | "instagram" | "reddit" | "email";

const SCRIPTS: Record<Channel, { title: string; subject?: string; body: string }[]> = {
  youtube: [
    {
      title: "Cold DM (most creators check this)",
      body: `Hey [name] —

I built something for the exact audience you serve and I think it solves a real pain point.

ListingLauncher turns a one-line product description into a complete Etsy/Amazon/Shopify listing — title, description, 13 tags, SEO keywords, the works — in about 10 seconds. We also score and rewrite existing listings.

A few channels I think would benefit: [channel 1], [channel 2].

I'd love to give you a free Business account (worth $29/mo, 2,000 listings/month) so you can show the tool on camera. No script required — just your honest take. If you want a 20% affiliate link too, I can set that up.

Worth a 10-minute look? Here's a sample: https://listinglauncher.app/creators

— [your name]`,
    },
    {
      title: "Sponsorship pitch (if you have budget)",
      body: `Hi [name],

Quick pitch: ListingLauncher writes AI product listings for Etsy/Amazon sellers. We just launched a creator marketplace where sellers pay creators $50-200/promo to feature their listings.

We'd love to sponsor one video in the [listings/Etsy/Amazon] niche. Budget: $500–$1,500 depending on your typical rates. You get full creative control.

If interested, reply with your media kit and I'll send over a brief.

— [your name]`,
    },
  ],
  tiktok: [
    {
      title: "Creator marketplace short pitch",
      body: `heyo! i run listinglauncher — a tool that writes etsy/amazon listings in 10 sec. looking for a few tiktok creators in the handmade/diy/gifting space to try it out + film a 60-sec reaction. free business account ($29/mo value) + 20% affiliate. interested?`,
    },
    {
      title: "Sponsorship 1-liner",
      body: `hey! i'm building a marketplace for etsy/amazon creators — sellers pay $50-200 to get featured. budget for sponsored tiktoks is $200-500/video. want me to send the brief?`,
    },
  ],
  instagram: [
    {
      title: "DM to handmade/home/decor creator",
      body: `hi [name]! love your work. i built an ai tool that writes etsy/amazon product listings in 10 seconds (i'm an ex-etsy seller myself). i have a free business account ($29/mo, 2,000 listings) and a 30% affiliate program if you'd want to try it + share. no pressure at all — just thought your audience would appreciate it.`,
    },
  ],
  reddit: [
    {
      title: "r/EtsySellers post (NOT a sales pitch — share a useful sample)",
      body: `Title: I built a free AI listing tool and would love your feedback

Body:
Hi r/EtsySellers! I used to sell on Etsy and always hated writing listings. So I built an AI tool that does the title + 13 tags + SEO keywords + description in ~10 seconds. It's tuned to Etsy's algorithm (front-loads keywords, uses all 13 tag slots, etc).

Free 3 listings/month, no signup, no credit card: https://listinglauncher.app/generate

A real output for a soy candle:

**Title:** Hand-Poured Lavender Soy Candle | Wooden Wick | 50-Hour Burn | Natural Wax Gift

**Description:** (3 paragraphs about the product, materials, gifting angle)

**Tags (13):** soy wax candle, lavender candle, hand poured, aromatherapy, gift for her, home decor, natural candle, relaxing gift, scented candle, self care, cozy night, farmhouse decor, bathroom essentials

I'd genuinely love feedback — what does it miss, what does it get right? Will iterate based on what you tell me.

Also: there's a "Listing Audit" tool that scores an existing listing 0-100 and rewrites it. If you have a slow-selling listing, try it and let me know.

Not selling anything here — just want the tool to be genuinely useful.`,
    },
  ],
  email: [
    {
      title: "Affiliate outreach (warmer, longer form)",
      subject: "30% recurring for sending ListingLauncher to your audience",
      body: `Hey [name],

Long-time fan of your work on [platform]. Quick one.

I run ListingLauncher — we write AI product listings for Etsy, Amazon, and Shopify sellers. ~10s to generate a full listing, tuned to each marketplace's algorithm. 4,000+ listings written so far.

I think your audience would actually use this — you cover a lot of [handmade / e-commerce / marketing] content, and writing listings is one of those boring-but-critical tasks that everyone struggles with.

Here's the offer: 30% recurring for 12 months on every seller you refer, with a custom link and a 14-day attribution cookie. I pay out via Stripe Connect on the 1st of each month.

Free for sellers to try (3 listings/month, no credit card). You get paid when they pay.

If you want to test the tool first, I'll send you a free Pro account (300 listings/month, bulk, audit). Just reply.

Affiliate link: https://listinglauncher.app/?ref=[YOURCODE]

Payout terms + your dashboard: https://listinglauncher.app/affiliate

Let me know if you'd want to discuss — happy to jump on a call.

— [your name]
ListingLauncher`,
    },
  ],
};

const CHANNEL_META: Record<Channel, { label: string; emoji: string; hint: string }> = {
  youtube: { label: "YouTube creator", emoji: "▶", hint: "10K-500K subs · Easiest to convert" },
  tiktok: { label: "TikTok creator", emoji: "♪", hint: "DIY / handmade / gift niche" },
  instagram: { label: "Instagram creator", emoji: "◉", hint: "Home decor · lifestyle · shopping" },
  reddit: { label: "Reddit post", emoji: "↗", hint: "r/EtsySellers, r/AmazonSeller, r/Shopify" },
  email: { label: "Email outreach", emoji: "✉", hint: "Bloggers, newsletter writers, communities" },
};

export function PitchKit() {
  const [channel, setChannel] = useState<Channel>("youtube");
  const [copied, setCopied] = useState<number | null>(null);

  const scripts = SCRIPTS[channel];

  function copy(text: string, idx: number) {
    navigator.clipboard?.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <p className="text-sm text-ink-600">
        Ready-to-send outreach for influencers, creators, and communities.
        Personalize the brackets and send. Each script links the recipient to a
        specific reason to care (their audience, their pain, their revenue).
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(Object.keys(CHANNEL_META) as Channel[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChannel(c)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
              channel === c
                ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20"
                : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
            }`}
          >
            <span>{CHANNEL_META[c].emoji}</span>
            {CHANNEL_META[c].label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-500">{CHANNEL_META[channel].hint}</p>

      <div className="mt-6 space-y-4">
        {scripts.map((s, i) => (
          <div
            key={i}
            className="rounded-3xl border border-ink-200/80 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-ink-900">{s.title}</h3>
                {s.subject ? <p className="mt-0.5 text-xs text-ink-500">Subject: {s.subject}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => copy(s.body, i)}
                className="shrink-0 rounded-full border border-ink-200 bg-white px-4 py-1.5 text-xs font-semibold text-ink-700 transition-all hover:-translate-y-0.5 hover:bg-ink-100"
              >
                {copied === i ? "Copied ✓" : "Copy"}
              </button>
            </div>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-ink-50/70 p-4 text-sm leading-relaxed text-ink-700">
{s.body}
            </pre>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-50 to-brand-50 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-ink-900">Don&apos;t want to do outreach?</h3>
        <p className="mt-2 text-sm text-ink-600">
          Add a creator to the marketplace and they handle their own promotion.
          You take 15% of every booking — passive, recurring revenue.
        </p>
        <Link
          href="/creators/apply"
          className="mt-4 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-700"
        >
          Become a creator instead
        </Link>
      </div>
    </div>
  );
}
