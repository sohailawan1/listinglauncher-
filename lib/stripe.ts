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

export async function createCheckoutSession(args: {
  plan: "free" | "pro";
  origin: string;
}): Promise<{ url: string } | null> {
  const stripe = getStripe();
  if (!stripe || args.plan !== "pro") return null;

  const priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
  if (!priceId) return null;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${args.origin}/generate?upgraded=1`,
    cancel_url: `${args.origin}/pricing#pricing`,
    subscription_data: {
      metadata: { app: "listinglauncher" },
    },
  });

  return session.url ? { url: session.url } : null;
}