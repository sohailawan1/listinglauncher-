export const APP_NAME = "ListingLauncher";
export const APP_DESCRIPTION =
  "AI product listings that sell. Titles, descriptions, bullet points, and SEO tags for Etsy, Amazon, Shopify, and more.";

export const FREE_CREDITS_PER_MONTH = 3;

export type Plan = {
  id: "free" | "pro";
  name: string;
  price: number;
  priceLabel: string;
  creditsLabel: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Starter",
    price: 0,
    priceLabel: "$0",
    creditsLabel: `${FREE_CREDITS_PER_MONTH} listings / month`,
    features: [
      "3 AI listings per month",
      "Etsy, Amazon, Shopify formats",
      "Titles, descriptions & tags",
      "Copy-to-clipboard output",
    ],
    cta: "Start for free",
  },
  {
    id: "pro",
    name: "Pro",
    price: 9,
    priceLabel: "$9",
    creditsLabel: "Unlimited listings",
    features: [
      "Unlimited AI listings",
      "All marketplaces & tones",
      "Bulk listing generation",
      "Priority generation speed",
      "Keyword & SEO tags included",
      "Cancel anytime",
    ],
    cta: "Go Pro",
    highlighted: true,
  },
];