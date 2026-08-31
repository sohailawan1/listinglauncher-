import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import { generateJson, normalizeListing, PRIMARY_MODEL, FALLBACK_MODEL } from "@/lib/ai";
import type { GenerateResponse, ListingInput } from "@/lib/types";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  const limit = rateLimit(request);
  if (!limit.allowed) {
    return Response.json(
      {
        listing: null,
        error: `Too many requests. Please wait ${limit.retryAfterSeconds} second(s) and try again.`,
      } satisfies GenerateResponse,
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
        listing: null,
        error:
          "OpenRouter API key is not configured on the server. Add OPENROUTER_API_KEY to your environment.",
      } satisfies GenerateResponse,
      { status: 503 }
    );
  }

  let body: ListingInput;
  try {
    body = (await request.json()) as ListingInput;
  } catch {
    return Response.json(
      { listing: null, error: "Invalid request body." } satisfies GenerateResponse,
      { status: 400 }
    );
  }

  const productName = body.productName?.trim();
  if (!productName) {
    return Response.json(
      { listing: null, error: "Please enter a product name." } satisfies GenerateResponse,
      { status: 400 }
    );
  }

  const messages = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: buildUserPrompt(body) },
  ];

  const result = await generateJson<Parameters<typeof normalizeListing>[0]>(apiKey, messages);

  if (!result) {
    return Response.json(
      {
        listing: null,
        error: "The AI service is temporarily unavailable. Please try again in a moment.",
      } satisfies GenerateResponse,
      { status: 502 }
    );
  }

  const listing = normalizeListing(result.data);

  if (!listing.title && !listing.description) {
    return Response.json(
      {
        listing: null,
        error: "The AI returned an incomplete listing. Please try again.",
      } satisfies GenerateResponse,
      { status: 502 }
    );
  }

  return Response.json({
    listing,
    model: result.model === PRIMARY_MODEL ? PRIMARY_MODEL : FALLBACK_MODEL,
  } satisfies GenerateResponse & { model: string });
}
