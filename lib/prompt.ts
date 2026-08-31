import type { AuditInput, ListingInput } from "@/lib/types";

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

const MARKETPLACE_RULES: Record<string, string> = {
  etsy: [
    "Etsy rules: title under 140 characters, front-load the most searchable keywords.",
    "Provide exactly 13 tags, each 20 characters or fewer, all lowercase, multi-word long-tail phrases.",
  ].join(" "),
  amazon: [
    "Amazon rules: title under 200 characters, keyword-rich but readable.",
    "Bullet points follow the FEATURE -> BENEFIT pattern and start with a capitalized keyword.",
  ].join(" "),
  shopify: "Shopify rules: write for a brand store — storytelling allowed, keep SEO in the title and meta description.",
  ebay: "eBay rules: title under 80 characters, include brand, item type, and key attributes buyers search for.",
  other: "Keep the listing clear, benefit-led, and marketplace-agnostic.",
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
  lines.push(`Marketplace rules: ${MARKETPLACE_RULES[input.marketplace] ?? MARKETPLACE_RULES.other}`);
  lines.push(`Tone: ${TONE_GUIDANCE[input.tone]}`);
  if (input.audience?.trim()) lines.push(`Target audience: ${input.audience.trim()}`);
  if (input.details?.trim())
    lines.push(`Seller details: ${input.details.trim()}`);

  lines.push("");
  lines.push(
    "Respond with a JSON object using EXACTLY this shape (no markdown, no code fences):"
  );
  lines.push(`{
  "title": "complete listing title following the marketplace rules above",
  "shortTitle": "short, punchy title under 40 characters",
  "description": "3 persuasive paragraphs with a clear opening hook, feature and benefit breakdown, and a soft close that invites purchase",
  "bulletPoints": ["5 to 7 benefit-led bullets"],
  "tags": ["10 to 13 marketplace-style tags"],
  "keywords": ["8 to 10 search keywords someone would type"]
}`);

  return lines.join("\n");
}

export function buildAuditSystemPrompt(): string {
  return [
    "You are a ruthless but constructive e-commerce listing auditor.",
    "You evaluate product listings the way marketplace search algorithms and buyers do.",
    "You never invent facts — you only rephrase and restructure what the seller wrote.",
    "Always return ONLY valid JSON with no markdown fences, no commentary, no trailing text.",
  ].join("\n");
}

export function buildAuditUserPrompt(input: AuditInput): string {
  const lines: string[] = [];
  lines.push("Audit this product listing and produce an improved version.");
  lines.push("");
  lines.push(`Marketplace: ${MARKETPLACE_LABELS[input.marketplace ?? "other"]}`);
  lines.push(`Current title: ${input.title}`);
  lines.push("");
  lines.push("Current description:");
  lines.push(input.description);
  if (input.tags?.length) lines.push(`Current tags: ${input.tags.join(", ")}`);
  if (input.keywords?.length) lines.push(`Current keywords: ${input.keywords.join(", ")}`);
  lines.push("");
  lines.push("Evaluate: keyword coverage, search optimization, title structure, description persuasiveness, tag quality, and buyer psychology.");
  lines.push("");
  lines.push(
    "Respond with a JSON object using EXACTLY this shape (no markdown, no code fences):"
  );
  lines.push(`{
  "score": 0-100 overall listing quality score,
  "grade": "one of: Excellent, Good, Needs Work, Poor",
  "summary": "one-sentence verdict on the listing",
  "issues": [
    {
      "type": "one of: title, description, tags, keywords, general",
      "severity": "one of: high, medium, low",
      "message": "what is wrong, specific to this listing",
      "fix": "the concrete improvement to make"
    }
  ],
  "improvedListing": {
    "title": "rewritten optimized title",
    "shortTitle": "short punchy version under 40 characters",
    "description": "rewritten persuasive description",
    "bulletPoints": ["5 to 7 benefit-led bullets"],
    "tags": ["10 to 13 tags"],
    "keywords": ["8 to 10 search keywords"]
  }
}`);
  lines.push("Give 2 to 6 issues. Be specific to this listing, not generic advice.");

  return lines.join("\n");
}

export const DEFAULT_LISTING_INPUT: ListingInput = {
  productName: "",
  marketplace: "etsy",
  tone: "friendly",
  audience: "",
  details: "",
};
