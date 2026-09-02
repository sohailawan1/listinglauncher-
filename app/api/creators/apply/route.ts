import { saveCreator, getCreatorByOwner, type CreatorProfile } from "@/lib/store";
import { getSessionAccount, SESSION_COOKIE } from "@/lib/store";
import { sendEmail } from "@/lib/email";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const VALID_PLATFORMS = ["tiktok", "instagram", "youtube", "other"];

function generateCreatorId(): string {
  return `cr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function GET(): Promise<Response> {
  // Owner: get my creator profile (if any).
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) return Response.json({ creator: null });

  const creator = await getCreatorByOwner(account.id);
  return Response.json({ creator });
}

export async function POST(request: Request): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) {
    return Response.json(
      { error: "Create an account first, then apply to be a creator." },
      { status: 401 }
    );
  }

  const existing = await getCreatorByOwner(account.id);
  if (existing) {
    return Response.json({ error: "You've already applied. Check your dashboard." }, { status: 400 });
  }

  let body: {
    name?: string;
    bio?: string;
    platforms?: string[];
    niches?: string[];
    followers?: number;
    rateMin?: number;
    rateMax?: number;
    portfolio?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 80) || account.name;
  const bio = (body.bio ?? "").trim().slice(0, 500);
  const platforms = (body.platforms ?? []).filter((p) => VALID_PLATFORMS.includes(p));
  const niches = (body.niches ?? []).map((n) => n.trim().slice(0, 40)).filter(Boolean).slice(0, 8);
  const followers = Math.max(0, Math.min(50_000_000, Math.round(Number(body.followers) || 0)));
  const rateMin = Math.max(0, Math.min(100_000, Math.round(Number(body.rateMin) || 0)));
  const rateMax = Math.max(rateMin, Math.min(100_000, Math.round(Number(body.rateMax) || rateMin)));
  const portfolio = (body.portfolio ?? []).map((u) => String(u).slice(0, 200)).slice(0, 6);

  if (platforms.length === 0) {
    return Response.json({ error: "Pick at least one platform you create on." }, { status: 400 });
  }
  if (niches.length === 0) {
    return Response.json({ error: "Add at least one niche (e.g. 'home decor', 'Amazon FBA')." }, { status: 400 });
  }
  if (bio.length < 20) {
    return Response.json({ error: "Bio should be at least 20 characters." }, { status: 400 });
  }

  const creator: CreatorProfile = {
    id: generateCreatorId(),
    ownerAccountId: account.id,
    name,
    email: account.email,
    bio,
    platforms,
    niches,
    followers,
    rateMin,
    rateMax,
    portfolio,
    status: "pending",
    stripeAccountId: null,
    stripeOnboarded: false,
    createdAt: Date.now(),
    approvedAt: null,
  };

  await saveCreator(creator);
  await sendEmail(account.email, "creator_application_received", {});

  return Response.json({ creator });
}
