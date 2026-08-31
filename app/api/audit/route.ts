import { buildAuditSystemPrompt, buildAuditUserPrompt } from "@/lib/prompt";
import { generateJson, normalizeListing } from "@/lib/ai";
import type {
  AuditInput,
  AuditIssue,
  AuditReport,
  AuditResponse,
  GeneratedListing,
} from "@/lib/types";
import { rateLimit } from "@/lib/rate-limit";
import {
  checkAuditUsage,
  getSessionAccount,
  recordError,
  recordUsage,
  SESSION_COOKIE,
} from "@/lib/store";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const maxDuration = 60;

type RawAudit = {
  score?: unknown;
  grade?: unknown;
  summary?: unknown;
  issues?: unknown;
  improvedListing?: Parameters<typeof normalizeListing>[0];
};

const VALID_ISSUE_TYPES = ["title", "description", "tags", "keywords", "general"] as const;
const VALID_SEVERITIES = ["high", "medium", "low"] as const;

function normalizeIssues(raw: unknown): AuditIssue[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((i): i is Record<string, unknown> => typeof i === "object" && i !== null)
    .map((i) => {
      const type = VALID_ISSUE_TYPES.includes(i.type as (typeof VALID_ISSUE_TYPES)[number])
        ? (i.type as AuditIssue["type"])
        : "general";
      const severity = VALID_SEVERITIES.includes(i.severity as (typeof VALID_SEVERITIES)[number])
        ? (i.severity as AuditIssue["severity"])
        : "medium";
      return {
        type,
        severity,
        message: String(i.message ?? "").slice(0, 500),
        fix: String(i.fix ?? "").slice(0, 500),
      };
    })
    .filter((i) => i.message);
}

function normalizeReport(raw: RawAudit): AuditReport | null {
  const improved = raw.improvedListing ? normalizeListing(raw.improvedListing) : null;
  if (!improved || (!improved.title && !improved.description)) return null;

  const score = Math.max(0, Math.min(100, Math.round(Number(raw.score) || 0)));

  return {
    score,
    grade:
      String(raw.grade ?? "").slice(0, 40) ||
      (score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work"),
    summary: String(raw.summary ?? "").slice(0, 300),
    issues: normalizeIssues(raw.issues).slice(0, 8),
    improvedListing: improved as GeneratedListing,
  };
}

export async function POST(request: Request): Promise<Response> {
  const limit = rateLimit(request);
  if (!limit.allowed) {
    return Response.json(
      {
        report: null,
        error: `Too many requests. Please wait ${limit.retryAfterSeconds} second(s) and try again.`,
      } satisfies AuditResponse,
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
        report: null,
        error: "Please create a free account to audit listings.",
      } satisfies AuditResponse,
      { status: 401 }
    );
  }

  const usage = await checkAuditUsage(account.id, account.plan);
  if (!usage.allowed) {
    return Response.json({ report: null, error: usage.reason } satisfies AuditResponse, {
      status: 402,
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    recordError("no-api-key").catch(() => {});
    return Response.json(
      {
        report: null,
        error: "OpenRouter API key is not configured. Add OPENROUTER_API_KEY to your environment.",
      } satisfies AuditResponse,
      { status: 503 }
    );
  }

  let body: Partial<AuditInput>;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { report: null, error: "Invalid request body." } satisfies AuditResponse,
      { status: 400 }
    );
  }

  const title = body.title?.trim().slice(0, 300) ?? "";
  const description = body.description?.trim().slice(0, 5000) ?? "";
  if (!title && !description) {
    return Response.json(
      { report: null, error: "Paste at least a title or a description to audit." } satisfies AuditResponse,
      { status: 400 }
    );
  }

  const messages = [
    { role: "system", content: buildAuditSystemPrompt() },
    {
      role: "user",
      content: buildAuditUserPrompt({
        title,
        description,
        tags: body.tags?.slice(0, 20),
        keywords: body.keywords,
        marketplace: body.marketplace ?? "other",
      }),
    },
  ];

  const result = await generateJson<RawAudit>(apiKey, messages);

  if (!result) {
    recordError("audit-failed").catch(() => {});
    return Response.json(
      {
        report: null,
        error: "The AI service is temporarily unavailable. Please try again in a moment.",
      } satisfies AuditResponse,
      { status: 502 }
    );
  }

  const report = normalizeReport(result.data);
  if (!report) {
    recordError("audit-empty").catch(() => {});
    return Response.json(
      { report: null, error: "Could not analyze this listing. Please try again." } satisfies AuditResponse,
      { status: 502 }
    );
  }

  await recordUsage(account.id, 1, "audit");

  return Response.json({
    report,
    usage: {
      usedMonthly: usage.usedMonthly + 1,
      limitMonthly: usage.limitMonthly,
      plan: usage.plan,
    },
  } satisfies AuditResponse & {
    usage: { usedMonthly: number; limitMonthly: number; plan: string };
  });
}
