import { getStripe } from "@/lib/stripe";
import { getSessionAccount, SESSION_COOKIE } from "@/lib/store";
import { cookies } from "next/headers";

export const runtime = "nodejs";

/**
 * Verify a Stripe Checkout Session ID (sent back to /photo after a successful
 * one-time payment) and confirm the user is entitled to run one lifestyle
 * generation.
 */
export async function POST(request: Request): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) return Response.json({ error: "Sign in first." }, { status: 401 });

  let body: { sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.sessionId) {
    return Response.json({ error: "Missing sessionId." }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) return Response.json({ error: "Stripe not configured." }, { status: 503 });

  try {
    const session = await stripe.checkout.sessions.retrieve(body.sessionId);
    if (session.payment_status !== "paid") {
      return Response.json({ paid: false, status: session.payment_status }, { status: 402 });
    }
    if (session.metadata?.type !== "lifestyle") {
      return Response.json({ error: "Wrong session type." }, { status: 400 });
    }
    return Response.json({
      paid: true,
      tier: session.metadata?.tier ?? "standard",
      accountId: session.metadata?.accountId,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Could not verify payment" },
      { status: 502 }
    );
  }
}
