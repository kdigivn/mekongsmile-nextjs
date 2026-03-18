import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://mekongsmile.com";

export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_DISABLE_ROBOTS === "true") {
    return {
      rules: [{ userAgent: "*", disallow: ["/"] }],
      sitemap: [],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/user/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
