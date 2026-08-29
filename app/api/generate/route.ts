import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import type { GenerateResponse, GeneratedListing, ListingInput } from "@/lib/types";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = (process.env.OPENROUTER_MODEL?.trim() || "deepseek/deepseek-v4-flash-0731");
const FALLBACK_MODEL = "z-ai/glm-5.2:free";

type OpenRouterMessage = { role: string; content: string };

async function callModel(
  apiKey: string,
  model: string,
  messages: OpenRouterMessage[]
): Promise<{ ok: boolean; status: number; data?: unknown; text?: string }> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://listinglauncher.app",
      "X-Title": "ListingLauncher",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    return { ok: false, status: res.status, text: (await res.text()).slice(0, 300) };
  }
  return { ok: true, status: res.status, data: await res.json() };
}

function extractJson(raw: string): GeneratedListing | null {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (typeof parsed !== "object" || parsed === null) return null;
    return {
      title: String(parsed.title ?? ""),
      shortTitle: String(parsed.shortTitle ?? ""),
      description: String(parsed.description ?? ""),
      bulletPoints: Array.isArray(parsed.bulletPoints)
        ? parsed.bulletPoints.map(String)
        : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String) : [],
    };
  } catch {
    return null;
  }
}

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

  const messages: OpenRouterMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: buildUserPrompt(body) },
  ];

  // 1) Try the primary (paid) model.
  const primary = await callModel(apiKey, MODEL, messages);
  let usedFallback = false;

  let listing: GeneratedListing | null = null;
  let usedPrimary = true;

  if (primary.ok) {
    const content: string = (primary.data as { choices?: { message?: { content?: string } }[] })
      ?.choices?.[0]?.message?.content ?? "";
    listing = extractJson(content);
    usedPrimary = listing ? true : false;
  }

  // 2) If the primary model failed (no balance, rate-limited, error, or bad
  //    output), automatically retry with a free model so users always get a
  //    result — even while your OpenRouter balance is at $0.
  if (!listing) {
    const fallback = await callModel(apiKey, FALLBACK_MODEL, messages);
    usedFallback = true;
    if (fallback.ok) {
      const content: string =
        (fallback.data as { choices?: { message?: { content?: string } }[] })
          ?.choices?.[0]?.message?.content ?? "";
      listing = extractJson(content);
    }
    if (!listing) {
      const detail = fallback.ok ? "Model returned invalid output." : `HTTP ${fallback.status}: ${fallback.text}`;
      return Response.json(
        {
          listing: null,
          error: "The AI service is temporarily unavailable. Please try again in a moment.",
          detail,
        } satisfies GenerateResponse & { detail: string },
        { status: 502 }
      );
    }
  }

  return Response.json({ listing, model: usedPrimary && !usedFallback ? MODEL : FALLBACK_MODEL } satisfies GenerateResponse & {
    model: string;
  });
}