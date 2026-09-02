import { getBooking, saveBooking, getCreator, ADMIN_COOKIE } from "@/lib/store";
import { releaseCreatorPayout, PLATFORM_FEE_PERCENT, refundBookingPayment } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  if (jar.get(ADMIN_COOKIE)?.value !== "ok") {
    return Response.json({ error: "Admin only." }, { status: 401 });
  }

  let body: { bookingId?: string; action?: "release" | "refund" };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.bookingId || !body.action) {
    return Response.json({ error: "Provide bookingId and action." }, { status: 400 });
  }

  const booking = await getBooking(body.bookingId);
  if (!booking) return Response.json({ error: "Booking not found." }, { status: 404 });

  const creator = await getCreator(booking.creatorId);
  if (!creator) return Response.json({ error: "Creator no longer exists." }, { status: 400 });

  if (body.action === "refund") {
    if (booking.paymentIntentId) await refundBookingPayment(booking.paymentIntentId);
    booking.paymentStatus = "refunded";
    booking.status = "refunded";
    booking.updatedAt = Date.now();
    await saveBooking(booking);
    return Response.json({ booking, action: "refunded" });
  }

  // Release payout to creator.
  if (booking.status !== "completed" && booking.status !== "delivered") {
    return Response.json(
      { error: "Booking must be delivered and approved (completed) before release." },
      { status: 400 }
    );
  }
  if (booking.paymentStatus === "released") {
    return Response.json({ error: "Already released." }, { status: 400 });
  }
  if (!creator.stripeAccountId) {
    return Response.json({ error: "Creator has no Stripe account. Refund instead." }, { status: 400 });
  }

  const release = await releaseCreatorPayout({
    amountCents: booking.budget * 100,
    platformFeePercent: PLATFORM_FEE_PERCENT,
    connectedAccountId: creator.stripeAccountId,
    bookingId: booking.id,
    creatorId: creator.id,
  });

  if (!release) {
    return Response.json(
      { error: "Stripe payout failed. Check Stripe is configured and creator onboarding is complete." },
      { status: 502 }
    );
  }

  booking.paymentStatus = "released";
  booking.platformFee = release.feeCents / 100;
  booking.creatorPayout = release.payoutCents / 100;
  booking.status = "completed";
  booking.completedAt = Date.now();
  booking.updatedAt = Date.now();
  await saveBooking(booking);

  await sendEmail(creator.email, "booking_released", {
    creatorName: creator.name,
    listingTitle: booking.listingTitle,
    amount: booking.creatorPayout?.toFixed(2) ?? booking.budget.toString(),
  });
  await sendEmail(booking.sellerEmail, "review_request", {
    creatorName: creator.name,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/creators/${creator.id}?review=1&booking=${booking.id}`,
  }).catch(() => {});

  return Response.json({ booking, release });
}
