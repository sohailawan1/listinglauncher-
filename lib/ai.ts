import type { GeneratedListing } from "@/lib/types";

export type OpenRouterMessage = { role: string; content: string };

export const PRIMARY_MODEL =
  process.env.OPENROUTER_MODEL?.trim() || "deepseek/deepseek-v4-flash-0731";
export const FALLBACK_MODEL = "z-ai/glm-5.2:free";

export async function callModel(
  apiKey: string,
  model: string,
  messages: OpenRouterMessage[]
): Promise<{ ok: boolean; status: number; data?: unknown; text?: string }> {
  let res: Response;
  try {
    res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
        max_tokens: 4000,
      }),
    });
  } catch (err) {
    console.error(`[ai] fetch to OpenRouter failed for ${model}:`, err);
    return { ok: false, status: 0, text: String(err) };
  }

  if (!res.ok) {
    const text = (await res.text()).slice(0, 300);
    console.error(`[ai] OpenRouter ${model} responded ${res.status}:`, text);
    return { ok: false, status: res.status, text };
  }
  return { ok: true, status: res.status, data: await res.json() };
}

export function extractContent(data: unknown): string {
  const choice = (data as { choices?: { message?: Record<string, unknown> }[] })?.choices?.[0];
  const message = choice?.message;
  if (!message) return "";

  const content = message.content;
  if (typeof content === "string" && content.trim()) return content;

  // Reasoning models sometimes return the answer in reasoning fields instead of
  // content — recover it so the listing never comes back empty.
  const reasoningDetails = message.reasoning_details as { text?: string }[] | undefined;
  if (Array.isArray(reasoningDetails)) {
    const joined = reasoningDetails.map((d) => d?.text ?? "").join("").trim();
    if (joined) return joined;
  }
  const reasoning = message.reasoning;
  if (typeof reasoning === "string" && reasoning.trim()) return reasoning;

  return typeof content === "string" ? content : "";
}

export function extractJson<T>(raw: string): T | null {
  if (!raw) return null;
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

  // Fast path: first "{" to last "}".
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    } catch {
      // fall through to balanced-brace scan
    }
  }

  // Slow path: scan for the first complete balanced JSON object.
  let depth = 0;
  let inString = false;
  let escaped = false;
  let objStart = -1;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") {
      if (depth === 0) objStart = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && objStart !== -1) {
        try {
          return JSON.parse(cleaned.slice(objStart, i + 1)) as T;
        } catch {
          objStart = -1;
        }
      }
    }
  }
  return null;
}

export function normalizeListing(parsed: {
  title?: unknown;
  shortTitle?: unknown;
  description?: unknown;
  bulletPoints?: unknown;
  tags?: unknown;
  keywords?: unknown;
}): GeneratedListing {
  return {
    title: String(parsed.title ?? ""),
    shortTitle: String(parsed.shortTitle ?? ""),
    description: String(parsed.description ?? ""),
    bulletPoints: Array.isArray(parsed.bulletPoints) ? parsed.bulletPoints.map(String) : [],
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String) : [],
  };
}

/**
 * Call the primary model, then fall back to a free model if it fails.
 * Returns null if both fail, so callers can produce a friendly error.
 */
export async function generateJson<T>(
  apiKey: string,
  messages: OpenRouterMessage[]
): Promise<{ data: T; model: string } | null> {
  const primary = await callModel(apiKey, PRIMARY_MODEL, messages);
  if (primary.ok) {
    const parsed = extractJson<T>(extractContent(primary.data));
    if (parsed) return { data: parsed, model: PRIMARY_MODEL };
  }

  const fallback = await callModel(apiKey, FALLBACK_MODEL, messages);
  if (fallback.ok) {
    const parsed = extractJson<T>(extractContent(fallback.data));
    if (parsed) return { data: parsed, model: FALLBACK_MODEL };
  }

  return null;
}
