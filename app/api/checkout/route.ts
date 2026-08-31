import { createCheckoutSession } from "@/lib/stripe";
import type { PlanId } from "@/lib/plans";

export const runtime = "nodejs";

const VALID_PLANS: PlanId[] = ["free", "pro", "business"];

export async function POST(request: Request): Promise<Response> {
  let plan: PlanId;
  try {
    const body = (await request.json()) as { plan?: string };
    if (!VALID_PLANS.includes(body.plan as PlanId)) {
      return Response.json({ error: "Unknown plan." }, { status: 400 });
    }
    plan = body.plan as PlanId;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const session = await createCheckoutSession({ plan, origin });

  if (!session) {
    return Response.json(
      {
        error:
          "Payments are not configured yet. Add STRIPE_SECRET_KEY and STRIPE_PRICE_PRO_MONTHLY to get started.",
      },
      { status: 503 }
    );
  }

  return Response.json({ url: session.url });
}
