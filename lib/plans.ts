export const APP_NAME = "ListingLauncher";
export const APP_DESCRIPTION =
  "AI product listings that sell. Titles, descriptions, bullet points, and SEO tags for Etsy, Amazon, Shopify, and more.";

export const FREE_CREDITS_PER_MONTH = 3;

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
    creditsLabel: `${FREE_CREDITS_PER_MONTH} listings / month`,
    features: [
      "3 AI listings per month",
      "Etsy, Amazon, Shopify & eBay formats",
      "Titles, descriptions, benefits & tags",
      "Listing history saved on this device",
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
    creditsLabel: "Unlimited listings",
    features: [
      "Unlimited AI listings",
      "All marketplaces & 5 writing tones",
      "Listing Audit — score & rewrite",
      "Bulk CSV generation (up to 50 rows)",
      "Priority generation speed",
      "Keyword & SEO tags included",
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
    creditsLabel: "Unlimited + bulk at scale",
    features: [
      "Everything in Pro",
      "Bulk CSV generation (up to 500 rows)",
      "Multi-language translation",
      "Brand voice training",
      "Priority support",
      "Cancel anytime",
    ],
    cta: "Scale up",
    badge: "Best value",
  },
];
