export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readMinutes: number;
  content: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "etsy-listing-tips",
    title: "13 Etsy Listing Tips That Actually Move the Needle in 2026",
    description:
      "Etsy SEO isn't dead — it's just sharper. These are the listing patterns that consistently rank, convert, and beat the algorithm in 2026.",
    category: "Etsy",
    publishedAt: "2026-01-12",
    readMinutes: 8,
    content: `Etsy changed a lot in 2025. The algorithm rewards listings that get clicks **and** sales. Here are the patterns that actually win now.

## 1. Front-load the search term in the first 40 characters

The first 40 characters of your title show on mobile. Lead with what people search for, not your brand. "Vintage Sterling Silver Locket Necklace" beats "Handmade Heart Pendant by Artisan Jane".

## 2. Use all 13 tags, but be specific

Most sellers repeat the title. Don't. Tags catch *long-tail* searches the title doesn't. Each tag should be a different angle: use case, occasion, color, material, recipient, room, style.

## 3. 140 characters is a hard cap on the title

Etsy truncates with "..." past 140. Plan your keyword set, then order so the most important words come first.

## 4. First photo = click-through

White-background product shot, then lifestyle, then scale, then detail. Etsy shows 4 photos in search — make the first 4 tell the whole story.

## 5. Categories and attributes matter more than ever

The "Occasion" and "Recipient" attributes can pull your listing into gift guides — free, persistent traffic.

## 6. Description = scannable, not novel

Two paragraphs, three bullet groups, one shipping/policy line. People skim. Front-load the benefit.

## 7. Pricing psychology: end in 7 or 9

$24.97 converts better than $25.00. $48 vs $49? $49 wins.

## 8. Re-list strategically

Etsy's algorithm treats re-listing as a freshness signal. Re-list your slow movers every 30–60 days, off-peak hours.

## 9. Renew your photos quarterly

Same product, better photo = +20% click-through is normal. You don't need new listings; you need better ones.

## 10. Customer photos > stock photos

The buyer's mental image is "how will this look in my life?" Real-customer lifestyle shots answer that question.

## 11. Respond to questions in under 6 hours

Etsy shows "Seller usually responds within X hours" on the listing. Lower is better. Aim for 1.

## 12. Bump on slow days

Thursday evening through Sunday morning is your highest-traffic window. Run Etsy Ads during these hours only.

## 13. Audit your top 5 listings monthly

Open Listing Audit, paste in your best sellers, see what to fix. Most sellers have a 60–100 score they don't know about.

Want to write 10 of these in 30 seconds? [Open the generator](/generate) — Etsy is one of four marketplaces we format for, and the prompt rules in the system are tuned to Etsy's algorithm in 2026.`,
  },
  {
    slug: "amazon-product-listing-seo",
    title: "Amazon Product Listing SEO: The 2026 Playbook",
    description:
      "Amazon's A9/A10 algorithm isn't the same game as Google. Here's the exact listing structure that ranks and converts in 2026.",
    category: "Amazon",
    publishedAt: "2026-01-20",
    readMinutes: 10,
    content: `Amazon is the largest search engine for product queries. Listing SEO isn't about blog links — it's about relevance, conversion, and inventory signals.

## What Amazon's algorithm actually measures

- **Click-through rate** on the search results page
- **Conversion rate** once a shopper lands on your listing
- **Session time** (longer = more intent match)
- **Buy Box %** (multi-seller)
- **Sales velocity** (especially 7-day rolling)

## Title: 200 characters, but only first 60 are visible

Put brand + core product + key feature first. Amazon truncates with "..." past ~60 chars on mobile search results. Example:

\`\`\`
LEWENGS 2-Tier Acacia Salad Bowl Set — Hand-Polished Wooden Serving Bowls, 9.5" & 11.8" — for Fruits, Salads, Pasta — Dishwasher-Safe — Holiday Gift
\`\`\`

## Bullets are the most important 5 lines on the page

Use the **FEATURE → BENEFIT** pattern. The reader's left brain wants the feature, the right brain wants the benefit. Give both.

\`\`\`
• **HAND-POLISHED ACACIA WOOD** — Each bowl is finished by hand for a smooth, splinter-free surface that's safe for the whole family.
• **TWO SIZES FOR ANY OCCASION** — 9.5" for weeknight salads, 11.8" for entertaining. Stack together for compact storage.
\`\`\`

## Backend keywords: 249 bytes, no commas, no spaces

These are searches your title can't match. Pack them with synonyms and use cases the title already implies.

\`\`\`
wooden bowl fruit salad serving platter acacia wood hand polished stackable dinner party wedding gift
\`\`\`

## A+ Content: 5+ modules = 5%+ conversion lift

Don't bury your A+ below the buy box. First module = single hero image + key benefit. Subsequent = comparison, use case, cross-sell.

## Pricing affects rank, not just conversion

Amazon's algorithm penalizes listings that look like arbitrage. Keep your price within 10% of median for the category, or run a price-test promo to establish a sales history.

## Reviews: the slow, compounding asset

Every 0.1 stars higher = roughly 2% conversion lift. The single best investment is the post-purchase email (Amazon Brand Registry) requesting a photo review.

## What to skip

- Keyword stuffing in the title
- All-caps BOLD SCREAMING bullets
- Backend search terms with commas (waste of bytes)
- A+ Content that's just a sales pitch

Want to generate an Amazon-formatted listing in 10 seconds? [Open the generator](/generate) — the prompt rules in our system are tuned to A10's actual ranking factors, not generic "good copywriting".`,
  },
  {
    slug: "shopify-conversion-tips",
    title: "5 Shopify Listing & Page Tweaks That Doubled Our Conversion Rate",
    description:
      "The first 200 words of a Shopify product page decide 80% of sales. Here's the structure we tested and what beat everything else.",
    category: "Shopify",
    publishedAt: "2026-02-04",
    readMinutes: 6,
    content: `Shopify gives you the freedom to write a story. The mistake is treating that freedom as license to write a novel. Here are the patterns that actually move the needle.

## 1. The H1 is the only thing the customer can be sure of

Scrolling tests show 100% of customers see your H1. Roughly 30% see the second paragraph. Don't bury the benefit in the H1. "The journal that survived 4 years of international travel" > "Handmade Journal".

## 2. Use bullets above the fold for the skim-readers

The first 3 bullets should be the three things that make this product *different* from competitors, not features any alternative has.

## 3. Social proof in the first scroll

A 1-line "Featured in [Pub] · 12,500 sold" or 5 stars with review count above the fold. Trust must precede desire for a new visitor.

## 4. Lifestyle image, then product image, then scale, then detail

Story first, then the thing itself, then the size, then the close-up. Mirror how a friend would show you the product.

## 5. The last bullet is the call to action

"30-day returns · Ships in 1 business day · Comes gift-wrapped free" — the final bullet removes the last objection. Place it last so it stays visible.

## What we cut that didn't help

- Long "About the maker" sections above the fold
- Animated hero images (added 2.1 seconds to LCP, killed conversion)
- Chat widgets on cold traffic (pushy, lower trust)

The full set of platform-specific rules (titles, tags, description length, etc.) is built into [our generator](/generate) — it knows the difference between what Amazon, Etsy, Shopify, and eBay each expect.`,
  },
];

export function getPost(slug: string): BlogPost | null {
  return blogPosts.find((p) => p.slug === slug) ?? null;
}
