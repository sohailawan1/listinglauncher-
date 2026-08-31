import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import { callModel, extractContent, extractJson, normalizeListing, PRIMARY_MODEL, FALLBACK_MODEL } from "@/lib/ai";
import { DEFAULT_LISTING_INPUT } from "@/lib/prompt";
import type { BulkResponse, GeneratedListing, ListingInput, Marketplace, Tone } from "@/lib/types";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_ROWS = 50;

type RawParsed = Parameters<typeof normalizeListing>[0];

async function generateOne(
  apiKey: string,
  productName: string,
  details: string,
  marketplace: Marketplace,
  tone: Tone
): Promise<GeneratedListing | null> {
  const input: ListingInput = {
    ...DEFAULT_LISTING_INPUT,
    productName,
    details,
    marketplace,
    tone,
  };

  const messages = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: buildUserPrompt(input) },
  ];

  const attempt = async (): Promise<GeneratedListing | null> => {
    const primary = await callModel(apiKey, PRIMARY_MODEL, messages);
    if (primary.ok) {
      const parsed = extractJson<RawParsed>(extractContent(primary.data));
      if (parsed) return normalizeListing(parsed);
    }
    const fallback = await callModel(apiKey, FALLBACK_MODEL, messages);
    if (fallback.ok) {
      const parsed = extractJson<RawParsed>(extractContent(fallback.data));
      if (parsed) return normalizeListing(parsed);
    }
    return null;
  };

  // One retry — transient upstream hiccups are common with batch jobs.
  return (await attempt()) ?? (await attempt());
}

export async function POST(request: Request): Promise<Response> {
  const limit = rateLimit(request);
  if (!limit.allowed) {
    return Response.json(
      {
        listings: [],
        failed: [],
        error: `Too many requests. Please wait ${limit.retryAfterSeconds} second(s) and try again.`,
      } satisfies BulkResponse,
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        listings: [],
        failed: [],
        error: "OpenRouter API key is not configured. Add OPENROUTER_API_KEY to your environment.",
      } satisfies BulkResponse,
      { status: 503 }
    );
  }

  let body: {
    rows?: { productName?: string; details?: string }[];
    marketplace?: string;
    tone?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { listings: [], failed: [], error: "Invalid request body." } satisfies BulkResponse,
      { status: 400 }
    );
  }

  const rows = (body.rows ?? [])
    .map((r) => ({ productName: (r.productName ?? "").trim(), details: (r.details ?? "").trim() }))
    .filter((r) => r.productName)
    .slice(0, MAX_ROWS);

  if (rows.length === 0) {
    return Response.json(
      { listings: [], failed: [], error: "No valid product names found in the file." } satisfies BulkResponse,
      { status: 400 }
    );
  }

  const marketplace = (body.marketplace as Marketplace) || "etsy";
  const tone = (body.tone as Tone) || "friendly";

  // Process in small batches so we don't blow past OpenRouter's rate limits.
  const listings: GeneratedListing[] = [];
  const failed: { productName: string; error: string }[] = [];
  const BATCH = 3;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (row) => {
        try {
          const listing = await generateOne(apiKey, row.productName, row.details, marketplace, tone);
          return { row, listing };
        } catch {
          return { row, listing: null };
        }
      })
    );

    for (const r of results) {
      if (r.listing) listings.push(r.listing);
      else failed.push({ productName: r.row.productName, error: "Generation failed — try this row again." });
    }
  }

  return Response.json({ listings, failed } satisfies BulkResponse);
}
