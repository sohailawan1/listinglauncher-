import Stripe from "stripe";

let stripeClient: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (stripeClient !== undefined) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    stripeClient = null;
    return null;
  }
  stripeClient = new Stripe(key);
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

const PRICE_ENV_BY_PLAN: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY,
  business: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
};

export async function createCheckoutSession(args: {
  plan: string;
  origin: string;
}): Promise<{ url: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const priceId = PRICE_ENV_BY_PLAN[args.plan];
  if (!priceId) return null;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${args.origin}/generate?upgraded=1`,
    cancel_url: `${args.origin}/#pricing`,
    subscription_data: {
      metadata: { app: "listinglauncher", plan: args.plan },
    },
  });

  return session.url ? { url: session.url } : null;
}
