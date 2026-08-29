import type { ListingInput } from "@/lib/types";

const MARKETPLACE_LABELS: Record<string, string> = {
  etsy: "Etsy (handmade, craft, vintage, home decor, gifts)",
  amazon: "Amazon (search-optimized, conversion-focused)",
  shopify: "Shopify (brand-building, storytelling)",
  ebay: "eBay (trust-building, condition-focused)",
  other: "a general e-commerce marketplace",
};

const TONE_GUIDANCE: Record<string, string> = {
  friendly: "Warm, approachable, conversational",
  luxury: "Premium, elegant, aspirational, refined",
  playful: "Fun, energetic, witty, personality-driven",
  minimal: "Clean, concise, modern, no fluff",
  urgent: "Persuasive, scarcity-driven, strong call to action",
};

export function buildSystemPrompt(): string {
  return [
    "You are a senior e-commerce copywriter and search optimization specialist.",
    "You write product listings that convert browsers into buyers.",
    "You follow marketplace best practices for titles, descriptions, bullets, and tags.",
    "You never invent facts about materials, dimensions, or features — you work from what the seller provides.",
    "Always return ONLY valid JSON with no markdown fences, no commentary, no trailing text.",
  ].join("\n");
}

export function buildUserPrompt(input: ListingInput): string {
  const lines: string[] = [];
  lines.push("Create a complete, high-converting product listing.");
  lines.push("");
  lines.push(`Product name: ${input.productName}`);
  lines.push(`Marketplace: ${MARKETPLACE_LABELS[input.marketplace]}`);
  lines.push(`Tone: ${TONE_GUIDANCE[input.tone]}`);
  if (input.audience?.trim()) lines.push(`Target audience: ${input.audience.trim()}`);
  if (input.details?.trim())
    lines.push(`Seller details sold: ${input.details.trim()}`);

  lines.push("");
  lines.push(
    "Respond with a JSON object using EXACTLY this shape (no markdown, no code fences):"
  );
  lines.push(`{
  "title": "complete listing title under 140 characters",
  "shortTitle": "short, punchy title under 40 characters",
  "description": "3 persuasive paragraphs with a clear opening hook, feature and benefit breakdown, and a soft close that invites purchase",
  "bulletPoints": ["5 to 7 benefit-led bullets"],
  "tags": ["10 to 13 marketplace-style tags"],
  "keywords": ["8 to 10 search keywords someone would type"]
}`);

  return lines.join("\n");
}

export const DEFAULT_LISTING_INPUT: ListingInput = {
  productName: "",
  marketplace: "etsy",
  tone: "friendly",
  audience: "",
  details: "",
};