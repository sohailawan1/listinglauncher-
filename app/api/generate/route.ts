import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import { generateJson, normalizeListing, PRIMARY_MODEL, FALLBACK_MODEL } from "@/lib/ai";
import type { GenerateResponse, ListingInput } from "@/lib/types";
import { rateLimit } from "@/lib/rate-limit";
import {
  checkUsage,
  getSessionAccount,
  recordError,
  recordUsage,
  SESSION_COOKIE,
} from "@/lib/store";
import { cookies } from "next/headers";

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

  // ---- auth: account required, plan decides limits ----
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) {
    return Response.json(
      {
        listing: null,
        error: "Please create a free account to generate listings. It takes 10 seconds.",
      } satisfies GenerateResponse,
      { status: 401 }
    );
  }

  const usage = await checkUsage(account.id, account.plan, 1);
  if (!usage.allowed) {
    return Response.json({ listing: null, error: usage.reason } satisfies GenerateResponse, {
      status: 402,
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    recordError("no-api-key").catch(() => {});
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

  const productName = body.productName?.trim().slice(0, 300);
  if (!productName) {
    return Response.json(
      { listing: null, error: "Please enter a product name." } satisfies GenerateResponse,
      { status: 400 }
    );
  }
  body.productName = productName;
  if (body.details) body.details = body.details.slice(0, 5000);
  if (body.audience) body.audience = body.audience.slice(0, 300);

  const messages = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: buildUserPrompt(body) },
  ];

  const result = await generateJson<Parameters<typeof normalizeListing>[0]>(apiKey, messages);

  if (!result) {
    recordError("generate-failed").catch(() => {});
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
    recordError("generate-empty").catch(() => {});
    return Response.json(
      {
        listing: null,
        error: "The AI returned an incomplete listing. Please try again.",
      } satisfies GenerateResponse,
      { status: 502 }
    );
  }

  await recordUsage(account.id, 1, "listing");

  return Response.json({
    listing,
    model: result.model === PRIMARY_MODEL ? PRIMARY_MODEL : FALLBACK_MODEL,
    usage: {
      usedMonthly: usage.usedMonthly + 1,
      limitMonthly: usage.limitMonthly,
      plan: usage.plan,
    },
  } satisfies GenerateResponse & {
    model: string;
    usage: { usedMonthly: number; limitMonthly: number; plan: string };
  });
}
