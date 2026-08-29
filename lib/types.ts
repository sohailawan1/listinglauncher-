export type Marketplace = "etsy" | "amazon" | "shopify" | "ebay" | "other";
export type Tone = "friendly" | "luxury" | "playful" | "minimal" | "urgent";

export type ListingInput = {
  productName: string;
  marketplace: Marketplace;
  tone: Tone;
  audience: string;
  details: string;
};

export type GeneratedListing = {
  title: string;
  shortTitle: string;
  description: string;
  bulletPoints: string[];
  tags: string[];
  keywords: string[];
};

export type GenerateResponse = {
  listing: GeneratedListing | null;
  error?: string;
};