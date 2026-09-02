import { saveAffiliate, type Affiliate } from "@/lib/store";
import { getSessionAccount, SESSION_COOKIE } from "@/lib/store";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) return Response.json({ affiliate: null, referrals: [] });

  const { getAffiliateByOwner, listAffiliateReferrals } = await import("@/lib/store");
  const affiliate = await getAffiliateByOwner(account.id);
  const referrals = affiliate ? await listAffiliateReferrals(affiliate.code) : [];
  return Response.json({ affiliate, referrals });
}

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) return Response.json({ error: "Sign in to become an affiliate." }, { status: 401 });

  const { getAffiliateByOwner } = await import("@/lib/store");
  const existing = await getAffiliateByOwner(account.id);
  if (existing) return Response.json({ affiliate: existing });

  let code = generateCode();
  // Re-roll on collision (rare with 6 chars base-36).
  for (let i = 0; i < 5; i++) {
    const { getAffiliateByCode } = await import("@/lib/store");
    if (!(await getAffiliateByCode(code))) break;
    code = generateCode();
  }

  const affiliate: Affiliate = {
    id: `af_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`,
    ownerAccountId: account.id,
    code,
    rate: 30,
    status: "active",
    totalEarnings: 0,
    pendingEarnings: 0,
    createdAt: Date.now(),
  };
  await saveAffiliate(affiliate);
  return Response.json({ affiliate });
}
