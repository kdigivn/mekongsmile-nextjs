import type { MetadataRoute } from "next";
import {
  getAllTourSlugs,
  getAllBlogPosts,
  getAllPages,
  getAllDestinations,
} from "@/services/wordpress";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://mekongsmile.com";

export async function generateSitemaps() {
  return [
    { id: "tours" },
    { id: "posts" },
    { id: "destinations" },
    { id: "pages" },
  ];
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  switch (id) {
    case "tours": {
      const slugs = await getAllTourSlugs();
      return slugs.map((t) => ({
        url: `${BASE_URL}/tour/${t.slug}/`,
        priority: 0.9,
        changeFrequency: "weekly" as const,
      }));
    }

    case "posts": {
      const { nodes: posts } = await getAllBlogPosts(200);
      return posts.map((p) => ({
        url: `${BASE_URL}/blog/${p.slug}/`,
        priority: 0.7,
        changeFrequency: "weekly" as const,
      }));
    }

    case "destinations": {
      const destinations = await getAllDestinations();
      return destinations.flatMap((d) => [
        {
          url: `${BASE_URL}/destination/${d.slug}/`,
          priority: 0.8,
          changeFrequency: "weekly" as const,
        },
        ...(d.children?.nodes || []).map((c) => ({
          url: `${BASE_URL}/destination/${c.slug}/`,
          priority: 0.8,
          changeFrequency: "weekly" as const,
        })),
      ]);
    }

    case "pages": {
      const pages = await getAllPages();
      return pages.map((p) => ({
        url: `${BASE_URL}/${p.slug}/`,
        priority: 0.6,
        changeFrequency: "monthly" as const,
      }));
    }

    default:
      return [];
  }
}
