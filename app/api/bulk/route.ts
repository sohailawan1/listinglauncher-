import { buildSystemPrompt, buildUserPrompt, DEFAULT_LISTING_INPUT } from "@/lib/prompt";
import {
  callModel,
  extractContent,
  extractJson,
  normalizeListing,
  PRIMARY_MODEL,
  FALLBACK_MODEL,
} from "@/lib/ai";
import type { BulkResponse, GeneratedListing, ListingInput, Marketplace, Tone } from "@/lib/types";
import { rateLimit } from "@/lib/rate-limit";
import {
  checkUsage,
  getSessionAccount,
  planLimits,
  recordError,
  recordUsage,
  SESSION_COOKIE,
} from "@/lib/store";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const maxDuration = 300;

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

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) {
    return Response.json(
      {
        listings: [],
        failed: [],
        error: "Please create a free account first, then upgrade to Pro for bulk generation.",
      } satisfies BulkResponse,
      { status: 401 }
    );
  }

  const limits = planLimits(account.plan);
  if (limits.bulkMaxRows === 0) {
    return Response.json(
      {
        listings: [],
        failed: [],
        error: "Bulk generation is a Pro feature. Upgrade to process your whole catalog.",
      } satisfies BulkResponse,
      { status: 402 }
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
    .map((r) => ({
      productName: (r.productName ?? "").trim().slice(0, 300),
      details: (r.details ?? "").trim().slice(0, 2000),
    }))
    .filter((r) => r.productName)
    .slice(0, limits.bulkMaxRows);

  if (rows.length === 0) {
    return Response.json(
      { listings: [], failed: [], error: "No valid product names found in the file." } satisfies BulkResponse,
      { status: 400 }
    );
  }

  const usage = await checkUsage(account.id, account.plan, rows.length);
  if (!usage.allowed) {
    return Response.json(
      { listings: [], failed: [], error: usage.reason } satisfies BulkResponse,
      { status: 402 }
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    recordError("no-api-key").catch(() => {});
    return Response.json(
      {
        listings: [],
        failed: [],
        error: "OpenRouter API key is not configured. Add OPENROUTER_API_KEY to your environment.",
      } satisfies BulkResponse,
      { status: 503 }
    );
  }

  const marketplace = (body.marketplace as Marketplace) || "etsy";
  const tone = (body.tone as Tone) || "friendly";

  const listings: GeneratedListing[] = [];
  const failed: { productName: string; error: string }[] = [];
  const BATCH = 5;

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

  if (listings.length > 0) {
    await recordUsage(account.id, listings.length, "listing");
  }
  if (failed.length > 0) {
    await recordError("bulk-partial-failure").catch(() => {});
  }

  return Response.json({
    listings,
    failed,
    usage: {
      usedMonthly: usage.usedMonthly + listings.length,
      limitMonthly: usage.limitMonthly,
      plan: usage.plan,
    },
  } satisfies BulkResponse & {
    usage: { usedMonthly: number; limitMonthly: number; plan: string };
  });
}
