export const APP_NAME = "ListingLauncher";
export const APP_DESCRIPTION =
  "AI product listings that sell. Titles, descriptions, bullet points, and SEO tags for Etsy, Amazon, Shopify, and more.";

export type PlanId = "free" | "pro" | "business";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  price: number;
  priceLabel: string;
  creditsLabel: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Starter",
    tagline: "Try it, love it, sell with it.",
    price: 0,
    priceLabel: "$0",
    creditsLabel: "3 listings / month",
    features: [
      "3 AI listings per month",
      "1 listing audit per month",
      "All marketplace formats (Etsy, Amazon, Shopify, eBay)",
      "Listing library on your account",
      "Copy-to-clipboard output",
    ],
    cta: "Start for free",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For sellers who list every week.",
    price: 9,
    priceLabel: "$9",
    creditsLabel: "300 listings / month",
    features: [
      "300 AI listings per month",
      "100 listing audits per month",
      "Bulk CSV — up to 50 products at once",
      "All marketplaces & 5 writing tones",
      "Priority generation speed",
      "Creator marketplace access",
      "Cancel anytime",
    ],
    cta: "Go Pro",
    highlighted: true,
    badge: "Most popular",
  },
  {
    id: "business",
    name: "Business",
    tagline: "For stores with a full catalog.",
    price: 29,
    priceLabel: "$29",
    creditsLabel: "2,000 listings / month",
    features: [
      "2,000 AI listings per month",
      "500 listing audits per month",
      "Bulk CSV — up to 200 products at once",
      "Everything in Pro",
      "Highest priority speed",
      "Priority support",
      "Cancel anytime",
    ],
    cta: "Scale up",
    badge: "Best value",
  },
];

/** Server-enforced limits — single source of truth for /api routes. */
export const PLAN_LIMITS: Record<PlanId, { monthly: number; daily: number; audits: number; bulkRows: number }> = {
  free: { monthly: 3, daily: 3, audits: 1, bulkRows: 0 },
  pro: { monthly: 300, daily: 50, audits: 100, bulkRows: 50 },
  business: { monthly: 2000, daily: 300, audits: 500, bulkRows: 200 },
};
