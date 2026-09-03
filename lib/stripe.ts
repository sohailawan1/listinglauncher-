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
  email?: string;
  accountId?: string;
}): Promise<{ url: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const priceId = PRICE_ENV_BY_PLAN[args.plan];
  if (!priceId) return null;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${args.origin}/account?upgraded=1`,
    cancel_url: `${args.origin}/#pricing`,
    ...(args.email ? { customer_email: args.email } : {}),
    subscription_data: {
      metadata: {
        app: "listinglauncher",
        plan: args.plan,
        ...(args.accountId ? { accountId: args.accountId } : {}),
      },
    },
  });

  return session.url ? { url: session.url } : null;
}

/* ============================ STRIPE CONNECT ============================= */

export const PLATFORM_FEE_PERCENT = 15;

export type ConnectAccount = {
  id: string;
  onboardingUrl: string;
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
};

export async function createConnectAccount(args: {
  email: string;
  name: string;
  origin: string;
  returnUrl: string;
  refreshUrl: string;
}): Promise<ConnectAccount | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const account = await stripe.accounts.create({
    type: "express",
    email: args.email,
    business_type: "individual",
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    business_profile: {
      name: args.name,
      product_description: "Promoting small business product listings on TikTok, Instagram and YouTube.",
    },
    metadata: { app: "listinglauncher" },
  });

  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: args.refreshUrl,
    return_url: args.returnUrl,
    type: "account_onboarding",
  });

  return {
    id: account.id,
    onboardingUrl: link.url,
    detailsSubmitted: Boolean(account.details_submitted),
    payoutsEnabled: Boolean(account.payouts_enabled),
  };
}

export async function getConnectAccountStatus(accountId: string) {
  const stripe = getStripe();
  if (!stripe) return null;
  const acc = await stripe.accounts.retrieve(accountId);
  return {
    detailsSubmitted: Boolean(acc.details_submitted),
    payoutsEnabled: Boolean(acc.payouts_enabled),
    chargesEnabled: Boolean(acc.charges_enabled),
    requirements: acc.requirements?.currently_due ?? [],
  };
}

/**
 * Create a PaymentIntent on the PLATFORM account. Money is held in the
 * platform balance until the admin releases it to the creator.
 */
export async function createBookingPaymentIntent(args: {
  amountCents: number;
  sellerEmail: string;
  sellerAccountId: string;
  creatorId: string;
  bookingId: string;
  listingTitle: string;
}): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;
  const intent = await stripe.paymentIntents.create({
    amount: args.amountCents,
    currency: "usd",
    receipt_email: args.sellerEmail,
    description: `Promote: ${args.listingTitle.slice(0, 100)}`,
    automatic_payment_methods: { enabled: true },
    metadata: {
      app: "listinglauncher",
      type: "creator_booking",
      bookingId: args.bookingId,
      creatorId: args.creatorId,
      sellerAccountId: args.sellerAccountId,
    },
  });
  return { clientSecret: intent.client_secret ?? "", paymentIntentId: intent.id };
}

/**
 * Release held funds to a creator's connected account, taking the platform fee.
 */
export async function releaseCreatorPayout(args: {
  amountCents: number;
  platformFeePercent: number;
  connectedAccountId: string;
  bookingId: string;
  creatorId: string;
}): Promise<{ transferId: string; feeCents: number; payoutCents: number } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const feeCents = Math.round((args.amountCents * args.platformFeePercent) / 100);
  const payoutCents = args.amountCents - feeCents;

  const transfer = await stripe.transfers.create({
    amount: payoutCents,
    currency: "usd",
    destination: args.connectedAccountId,
    description: `Booking ${args.bookingId} payout`,
    metadata: {
      app: "listinglauncher",
      bookingId: args.bookingId,
      creatorId: args.creatorId,
    },
  });

  return { transferId: transfer.id, feeCents, payoutCents };
}

export async function refundBookingPayment(paymentIntentId: string): Promise<boolean> {
  const stripe = getStripe();
  if (!stripe) return false;
  await stripe.refunds.create({ payment_intent: paymentIntentId });
  return true;
}

/* ============================== LIFESTYLE CHECKOUT =========================== */

/** Per-image pricing for AI lifestyle scenes. */
export const LIFESTYLE_PRICES = {
  standard: 100, // $1.00 USD in cents
  hd: 200,      // $2.00 USD in cents
} as const;

export type LifestyleTier = keyof typeof LIFESTYLE_PRICES;

/**
 * Create a one-time Stripe Checkout Session for an AI lifestyle image.
 * Returns a URL the browser redirects to. After payment, the user lands on
 * /photo?paid=<sessionId> which the photo page picks up to run generation.
 */
export async function createLifestyleCheckoutSession(args: {
  tier: LifestyleTier;
  accountId: string;
  prompt: string;
  origin: string;
}): Promise<{ url: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const amount = LIFESTYLE_PRICES[args.tier];
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Lifestyle photo — ${args.tier === "hd" ? "HD (1536px)" : "Standard (1024px)"}`,
            description: `FLUX 1.1 Pro · ${args.prompt.slice(0, 100)}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    success_url: `${args.origin}/photo?paid=1&tier=${args.tier}&session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${args.origin}/photo?cancelled=1`,
    customer_email: undefined, // optionally pull from account
    metadata: {
      app: "listinglauncher",
      type: "lifestyle",
      tier: args.tier,
      accountId: args.accountId,
      prompt: args.prompt.slice(0, 500),
    },
  });
  return session.url ? { url: session.url } : null;
}
