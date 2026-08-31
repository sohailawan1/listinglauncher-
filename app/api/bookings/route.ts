import { getStore, getSessionAccount, SESSION_COOKIE, recordError, dayKey } from "@/lib/store";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export type InfluencerBooking = {
  id: string;
  createdAt: number;
  sellerAccountId: string;
  sellerEmail: string;
  listingTitle: string;
  productLink?: string;
  platform: "etsy" | "amazon" | "shopify" | "ebay" | "tiktok" | "instagram" | "youtube";
  budget: number;
  notes?: string;
  status: "pending" | "approved" | "rejected";
};

const VALID_PLATFORMS = ["etsy", "amazon", "shopify", "ebay", "tiktok", "instagram", "youtube"];
const VALID_STATUSES = ["pending", "approved", "rejected"];

export async function GET(): Promise<Response> {
  // Owners can list bookings; the store keys are scanned.
  const store = getStore();
  const keys = await store.keys("booking:*");
  const bookings: InfluencerBooking[] = [];
  for (const key of keys) {
    const raw = await store.get(key);
    if (!raw) continue;
    try {
      bookings.push(JSON.parse(raw) as InfluencerBooking);
    } catch {
      // skip corrupt rows
    }
  }
  bookings.sort((a, b) => b.createdAt - a.createdAt);
  return Response.json({ bookings: bookings.slice(0, 100) });
}

export async function POST(request: Request): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) {
    return Response.json(
      { error: "Create a free account first to book influencer promotions." },
      { status: 401 }
    );
  }

  let body: {
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

  const listingTitle = (body.listingTitle ?? "").trim().slice(0, 200);
  const platform = (body.platform ?? "").trim().toLowerCase();
  const budget = Math.max(5, Math.min(10000, Math.round(Number(body.budget) || 0)));

  if (!listingTitle) {
    return Response.json({ error: "Enter the listing you want promoted." }, { status: 400 });
  }
  if (!VALID_PLATFORMS.includes(platform)) {
    return Response.json({ error: "Choose a promotion platform." }, { status: 400 });
  }
  if (budget < 5) {
    return Response.json({ error: "Minimum budget is $5." }, { status: 400 });
  }

  const booking: InfluencerBooking = {
    id: `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
    sellerAccountId: account.id,
    sellerEmail: account.email,
    listingTitle,
    productLink: body.productLink?.trim().slice(0, 300) || undefined,
    platform: platform as InfluencerBooking["platform"],
    budget,
    notes: body.notes?.trim().slice(0, 1000) || undefined,
    status: "pending",
  };

  const store = getStore();
  await store.set(`booking:${booking.id}`, JSON.stringify(booking));
  await store.incr(`stats:bookings:${dayKey()}`);
  await store.incr(`stats:bookings:total`);
  await store.incr(`stats:bookings:volume:${dayKey()}`).catch(() => {});

  return Response.json({ booking });
}

export async function PATCH(request: Request): Promise<Response> {
  // Owner-only: update booking status.
  const jar = await cookies();
  if (jar.get("ll_admin")?.value !== "ok") {
    return Response.json({ error: "Not authorized." }, { status: 401 });
  }

  let body: { id?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.id || !VALID_STATUSES.includes(body.status ?? "")) {
    return Response.json({ error: "Provide booking id and a valid status." }, { status: 400 });
  }

  const store = getStore();
  const raw = await store.get(`booking:${body.id}`);
  if (!raw) {
    return Response.json({ error: "Booking not found." }, { status: 404 });
  }

  try {
    const booking = JSON.parse(raw) as InfluencerBooking;
    booking.status = body.status as InfluencerBooking["status"];
    await store.set(`booking:${body.id}`, JSON.stringify(booking));
    return Response.json({ booking });
  } catch {
    recordError("booking-corrupt").catch(() => {});
    return Response.json({ error: "Could not update booking." }, { status: 500 });
  }
}
