import { addCreatorReview, getBooking, getSessionAccount, SESSION_COOKIE } from "@/lib/store";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id: creatorId } = await ctx.params;
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) return Response.json({ error: "Sign in to leave a review." }, { status: 401 });

  let body: { bookingId?: string; rating?: number; text?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rating = Math.max(1, Math.min(5, Math.round(Number(body.rating) || 0)));
  const text = String(body.text ?? "").trim().slice(0, 600);
  if (rating < 1) return Response.json({ error: "Pick a rating from 1 to 5." }, { status: 400 });
  if (text.length < 5) return Response.json({ error: "Add a short comment." }, { status: 400 });

  // Booking must belong to this seller and be completed.
  const bookingId = body.bookingId;
  if (bookingId) {
    const booking = await getBooking(bookingId);
    if (!booking) return Response.json({ error: "Booking not found." }, { status: 404 });
    if (booking.sellerAccountId !== account.id) {
      return Response.json({ error: "You can only review your own bookings." }, { status: 403 });
    }
    if (booking.status !== "completed") {
      return Response.json({ error: "You can only review completed bookings." }, { status: 400 });
    }
  }

  const review = {
    id: `rv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`,
    creatorId,
    bookingId: bookingId ?? "",
    sellerAccountId: account.id,
    rating,
    text,
    createdAt: Date.now(),
  };
  await addCreatorReview(review);

  return Response.json({ review });
}
