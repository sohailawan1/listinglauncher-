import {
  getCreator,
  getSessionAccount,
  saveBooking,
  SESSION_COOKIE,
  type Booking,
} from "@/lib/store";
import { createBookingPaymentIntent } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const VALID_PLATFORMS = ["tiktok", "instagram", "youtube", "other"];
const VALID_STATUSES = ["pending", "in_progress", "delivered", "completed", "rejected", "refunded", "cancelled"];

export async function GET(): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) return Response.json({ bookings: [] });

  const { getCreatorByOwner, listAllBookings, ADMIN_COOKIE } = await import("@/lib/store");
  const isAdmin = jar.get(ADMIN_COOKIE)?.value === "ok";

  // Sellers see bookings they made; creators see bookings assigned to them.
  const creatorProfile = await getCreatorByOwner(account.id);
  const all = await listAllBookings();
  const mine = creatorProfile
    ? all.filter((b) => b.creatorId === creatorProfile.id)
    : all.filter((b) => b.sellerAccountId === account.id);
  if (!isAdmin) return Response.json({ bookings: mine });
  return Response.json({ bookings: all });
}

export async function POST(request: Request): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) {
    return Response.json(
      { error: "Create a free account first to book creator promotions." },
      { status: 401 }
    );
  }

  let body: {
    creatorId?: string;
    listingTitle?: string;
    productLink?: string;
    platform?: string;
    budget?: number;
    notes?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const creatorId = String(body.creatorId ?? "").trim();
  const listingTitle = (body.listingTitle ?? "").trim().slice(0, 200);
  const platform = (body.platform ?? "").trim().toLowerCase();
  const budget = Math.max(15, Math.min(10_000, Math.round(Number(body.budget) || 0)));

  const creator = await getCreator(creatorId);
  if (!creator || creator.status !== "approved") {
    return Response.json({ error: "This creator isn't accepting bookings right now." }, { status: 400 });
  }
  if (!creator.stripeOnboarded || !creator.stripeAccountId) {
    return Response.json(
      { error: "This creator hasn't set up payouts yet. Try another creator." },
      { status: 400 }
    );
  }
  if (!listingTitle) {
    return Response.json({ error: "Enter the listing you want promoted." }, { status: 400 });
  }
  if (!VALID_PLATFORMS.includes(platform)) {
    return Response.json({ error: "Choose a promotion platform." }, { status: 400 });
  }
  if (creator.rateMin > 0 && budget < creator.rateMin) {
    return Response.json(
      { error: `This creator's minimum is $${creator.rateMin}.` },
      { status: 400 }
    );
  }

  const booking: Booking = {
    id: `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    sellerAccountId: account.id,
    sellerEmail: account.email,
    creatorId: creator.id,
    creatorName: creator.name,
    listingTitle,
    productLink: body.productLink?.trim().slice(0, 300) || undefined,
    platform: platform as Booking["platform"],
    budget,
    notes: body.notes?.trim().slice(0, 1000) || undefined,
    status: "pending",
    paymentStatus: "unpaid",
  };

  // Try to create a Stripe payment intent. If Stripe isn't configured, the
  // booking is still created with paymentStatus=unpaid — admin can reconcile.
  const intent = await createBookingPaymentIntent({
    amountCents: budget * 100,
    sellerEmail: account.email,
    sellerAccountId: account.id,
    creatorId: creator.id,
    bookingId: booking.id,
    listingTitle,
  });
  if (intent) {
    booking.paymentIntentId = intent.paymentIntentId;
  }

  await saveBooking(booking);
  await sendEmail(account.email, "booking_received", { listingTitle, budget });

  return Response.json({ booking, clientSecret: intent?.clientSecret ?? null });
}

export async function PATCH(request: Request): Promise<Response> {
  const jar = await cookies();
  const isAdmin = jar.get("ll_admin")?.value === "ok";
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;

  let body: { id?: string; status?: string; deliveryUrl?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.id || !VALID_STATUSES.includes(body.status ?? "")) {
    return Response.json({ error: "Provide a booking id and valid status." }, { status: 400 });
  }

  const { getBooking, saveBooking, getCreator } = await import("@/lib/store");
  const booking = await getBooking(body.id);
  if (!booking) return Response.json({ error: "Booking not found." }, { status: 404 });

  const isSeller = account?.id === booking.sellerAccountId;
  const creatorProfile = await getCreator(booking.creatorId);
  const isCreator = creatorProfile?.ownerAccountId === account?.id;
  const sellerOk =
    isSeller && (body.status === "in_progress" || body.status === "cancelled" || body.status === "completed");
  const creatorOk =
    isCreator && (body.status === "in_progress" || body.status === "delivered" || body.status === "rejected");
  if (!isAdmin && !sellerOk && !creatorOk) {
    return Response.json({ error: "You can't perform this action." }, { status: 403 });
  }

  booking.status = body.status as Booking["status"];
  booking.updatedAt = Date.now();
  if (body.status === "delivered") booking.deliveredAt = Date.now();
  if (body.status === "completed") booking.completedAt = Date.now();

  await saveBooking(booking);

  if (body.status === "delivered") {
    await sendEmail(booking.sellerEmail, "booking_delivered", {
      creatorName: booking.creatorName,
      listingTitle: booking.listingTitle,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/creators/${booking.creatorId}?booking=${booking.id}`,
    });
  }
  if (body.status === "in_progress" && !isCreator && creatorProfile) {
    await sendEmail(creatorProfile.email, "booking_accepted", {
      creatorName: creatorProfile.name,
      listingTitle: booking.listingTitle,
      deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000).toLocaleDateString(),
    }).catch(() => {});
  }

  return Response.json({ booking });
}
