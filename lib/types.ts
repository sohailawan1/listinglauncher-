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

export type AuditIssue = {
  type: "title" | "description" | "tags" | "keywords" | "general";
  severity: "high" | "medium" | "low";
  message: string;
  fix: string;
};

export type AuditInput = {
  title: string;
  description: string;
  tags?: string[];
  keywords?: string[];
  marketplace?: Marketplace;
};

export type AuditReport = {
  score: number;
  grade: string;
  summary: string;
  issues: AuditIssue[];
  improvedListing: GeneratedListing;
};

export type AuditResponse = {
  report: AuditReport | null;
  error?: string;
};

export type BulkRowInput = {
  productName: string;
  details?: string;
};

export type BulkResponse = {
  listings: GeneratedListing[];
  failed: { productName: string; error: string }[];
  error?: string;
};
