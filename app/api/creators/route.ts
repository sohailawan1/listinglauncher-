import { listApprovedCreators, type CreatorProfile } from "@/lib/store";
import { listCreatorReviews } from "@/lib/store";

export const runtime = "nodejs";

export type CreatorWithStats = CreatorProfile & {
  rating: number;
  reviewCount: number;
};

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");
  const niche = searchParams.get("niche");
  const search = (searchParams.get("q") ?? "").trim().toLowerCase();

  const all = await listApprovedCreators();
  const filtered = all.filter((c) => {
    if (platform && platform !== "all" && !c.platforms.includes(platform)) return false;
    if (niche && niche !== "all" && !c.niches.includes(niche)) return false;
    if (search) {
      const hay = `${c.name} ${c.bio} ${c.niches.join(" ")} ${c.platforms.join(" ")}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  // Compute ratings (parallel).
  const withStats: CreatorWithStats[] = await Promise.all(
    filtered.map(async (c) => {
      const reviews = await listCreatorReviews(c.id);
      const rating =
        reviews.length > 0
          ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
          : 0;
      return { ...c, rating, reviewCount: reviews.length };
    })
  );

  // Aggregate all niches from the unfiltered approved set for filter chips.
  const nicheSet = new Set<string>();
  all.forEach((c) => c.niches.forEach((n) => nicheSet.add(n)));
  const niches = Array.from(nicheSet).sort();

  return Response.json({ creators: withStats, niches });
}
