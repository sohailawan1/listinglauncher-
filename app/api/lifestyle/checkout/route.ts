import { createLifestyleCheckoutSession, type LifestyleTier } from "@/lib/stripe";
import { getSessionAccount, SESSION_COOKIE } from "@/lib/store";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const VALID: LifestyleTier[] = ["standard", "hd"];

export async function POST(request: Request): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) return Response.json({ error: "Sign in to buy a lifestyle image." }, { status: 401 });

  let body: { tier?: string; prompt?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const tier = body.tier as LifestyleTier;
  if (!VALID.includes(tier)) {
    return Response.json({ error: "Pick standard or hd." }, { status: 400 });
  }
  const prompt = (body.prompt ?? "").trim().slice(0, 1000);
  if (prompt.length < 5) {
    return Response.json({ error: "Add a scene description first." }, { status: 400 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await createLifestyleCheckoutSession({
    tier,
    accountId: account.id,
    prompt,
    origin,
  });

  if (!session) {
    return Response.json(
      {
        error:
          "Payments are not configured yet. Add STRIPE_SECRET_KEY and try again. Background removal still works for free.",
      },
      { status: 503 }
    );
  }

  return Response.json({ url: session.url });
}
