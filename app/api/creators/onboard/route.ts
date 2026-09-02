import { createConnectAccount, getConnectAccountStatus } from "@/lib/stripe";
import { getCreatorByOwner, saveCreator, getSessionAccount, SESSION_COOKIE } from "@/lib/store";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) return Response.json({ error: "Sign in first." }, { status: 401 });

  const creator = await getCreatorByOwner(account.id);
  if (!creator) return Response.json({ error: "Apply to be a creator first." }, { status: 400 });
  if (creator.status !== "approved") {
    return Response.json(
      { error: "Your creator profile must be approved before you can accept payments." },
      { status: 400 }
    );
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const existing = creator.stripeAccountId;
  if (existing) {
    // Return fresh onboarding link for an already-created Express account.
    const status = await getConnectAccountStatus(existing);
    if (status?.detailsSubmitted && status.payoutsEnabled) {
      creator.stripeOnboarded = true;
      await saveCreator(creator);
      return Response.json({ alreadyOnboarded: true });
    }
  }

  const result = await createConnectAccount({
    email: account.email,
    name: creator.name,
    origin,
    returnUrl: `${origin}/creators/dashboard?onboarded=1`,
    refreshUrl: `${origin}/creators/dashboard?onboard_refresh=1`,
  });

  if (!result) {
    return Response.json(
      {
        error:
          "Stripe Connect is not configured. Add STRIPE_SECRET_KEY to enable creator payouts (see README).",
      },
      { status: 503 }
    );
  }

  creator.stripeAccountId = result.id;
  await saveCreator(creator);

  return Response.json({ onboardingUrl: result.onboardingUrl });
}

export async function GET(): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) return Response.json({ onboarded: false });

  const creator = await getCreatorByOwner(account.id);
  if (!creator?.stripeAccountId) return Response.json({ onboarded: false });

  const status = await getConnectAccountStatus(creator.stripeAccountId);
  if (status?.detailsSubmitted && status.payoutsEnabled) {
    creator.stripeOnboarded = true;
    await saveCreator(creator);
  }
  return Response.json({
    onboarded: Boolean(creator.stripeOnboarded),
    detailsSubmitted: Boolean(status?.detailsSubmitted),
    payoutsEnabled: Boolean(status?.payoutsEnabled),
    requirements: status?.requirements ?? [],
  });
}
