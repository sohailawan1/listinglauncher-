import { getCreator, listCreatorReviews } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await ctx.params;
  const creator = await getCreator(id);
  if (!creator || creator.status !== "approved") {
    return Response.json({ error: "Creator not found." }, { status: 404 });
  }
  const reviews = await listCreatorReviews(id);
  const rating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;
  return Response.json({ creator, reviews, rating, reviewCount: reviews.length });
}
