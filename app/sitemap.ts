import type { MetadataRoute } from "next";
import { listApprovedCreators } from "@/lib/store";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://listinglauncher.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE}/generate`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/audit`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/bulk`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/creators`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/photo`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/affiliate`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/account`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/blog/etsy-listing-tips`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/blog/amazon-product-listing-seo`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/blog/shopify-conversion-tips`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const creators = await listApprovedCreators();
  const creatorRoutes: MetadataRoute.Sitemap = creators.map((c) => ({
    url: `${SITE}/creators/${c.id}`,
    lastModified: new Date(c.approvedAt ?? c.createdAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...creatorRoutes];
}
