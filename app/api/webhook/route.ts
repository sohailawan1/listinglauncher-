import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getAccountByEmail, updateAccount } from "@/lib/store";

export const runtime = "nodejs";

async function setPlanForEmail(email: string, plan: "free" | "pro" | "business", customerId?: string): Promise<void> {
  const account = await getAccountByEmail(email);
  if (!account) return;
  account.plan = plan;
  if (customerId) account.stripeCustomerId = customerId;
  await updateAccount(account);
}

async function setPlanForCustomerId(customerId: string, plan: "free" | "pro" | "business"): Promise<void> {
  const stripe = getStripe();
  if (!stripe) return;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    const email = (customer as Stripe.Customer).email;
    if (email) await setPlanForEmail(email, plan, customerId);
  } catch (err) {
    console.error("[webhook] could not resolve customer:", err);
  }
}

function planFromPriceId(priceId: string | undefined): "pro" | "business" | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) return "pro";
  if (priceId === process.env.STRIPE_PRICE_BUSINESS_MONTHLY) return "business";
  return null;
}

export async function POST(request: Request): Promise<Response> {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    return new Response("Webhook not configured.", { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing signature.", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch {
    return new Response("Invalid signature.", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email ?? session.customer_email;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        const plan = session.metadata?.plan === "business" ? "business" : "pro";
        if (email) await setPlanForEmail(email, plan, customerId);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const active = sub.status === "active" || sub.status === "trialing";
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        if (active) {
          const item = sub.items.data[0];
          const plan = planFromPriceId(item?.price?.id);
          if (plan) await setPlanForCustomerId(customerId, plan);
        } else {
          await setPlanForCustomerId(customerId, "free");
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await setPlanForCustomerId(customerId, "free");
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[webhook] handler error:", err);
    return new Response("Webhook handler failed.", { status: 500 });
  }

  return Response.json({ received: true });
}
