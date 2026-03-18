/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SeoData } from "@/graphql/types";
import type { Metadata } from "next";

/** Replace WordPress backend URLs with frontend base URL in a string */
export const wpURLtoNextURL = (str: string) => {
  let cmsSite = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL;
  if (cmsSite) {
    const indexOfGraphql = cmsSite.indexOf("/graphql");
    cmsSite =
      indexOfGraphql !== -1 ? cmsSite.substring(0, indexOfGraphql) : cmsSite;
  }
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!cmsSite) return str;
  const replaceString = str.replace(new RegExp(cmsSite, "g"), siteUrl ?? "");

  return replaceString.replace(
    new RegExp(`${siteUrl}/wp-content/`, "g"),
    `${cmsSite}/wp-content/`
  );
};

/** Extract URI path from a WordPress URL */
export const getUriFromWpURL = (str: string) => {
  let cmsSite = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL;
  let site = cmsSite;
  if (cmsSite) {
    const indexOfGraphql = cmsSite.indexOf("/graphql");
    cmsSite =
      indexOfGraphql !== -1 ? cmsSite.substring(0, indexOfGraphql) : cmsSite;
    site = cmsSite.replace("cms.", "");
  }
  return str
    ?.replace(new RegExp(cmsSite ?? "", "g"), "")
    ?.replace(new RegExp(site ?? "", "g"), "");
};

// ─── Rank Math SeoData → Next.js Metadata ────────────────────────────────────

/**
 * Convert WPGraphQL Rank Math SeoData to a Next.js Metadata object.
 * Falls back to the provided title/description when SEO fields are absent.
 */
export function wpSeoToMetadata(
  seo: SeoData | undefined,
  fallback: { title: string; description: string }
): Metadata {
  if (!seo) {
    return { title: fallback.title, description: fallback.description };
  }

  const sanitized: SeoData = JSON.parse(wpURLtoNextURL(JSON.stringify(seo)));

  const ogImages = sanitized.openGraph?.image?.url
    ? [
        {
          url: sanitized.openGraph.image.url,
          width: sanitized.openGraph.image.width ?? undefined,
          height: sanitized.openGraph.image.height ?? undefined,
        },
      ]
    : [];

  const robotsMeta = sanitized.robots ?? [];

  return {
    title: sanitized.title || fallback.title,
    description: sanitized.description || fallback.description,
    keywords: sanitized.focusKeywords ?? undefined,
    robots: {
      index: !robotsMeta.includes("noindex"),
      follow: !robotsMeta.includes("nofollow"),
    },
    alternates: {
      canonical: sanitized.canonicalUrl || undefined,
    },
    openGraph: {
      title: sanitized.openGraph?.title || sanitized.title || fallback.title,
      description:
        sanitized.openGraph?.description ||
        sanitized.description ||
        fallback.description,
      url: sanitized.openGraph?.url || sanitized.canonicalUrl || undefined,
      siteName: sanitized.openGraph?.siteName || undefined,
      images: ogImages.length > 0 ? ogImages : undefined,
      type:
        sanitized.openGraph?.type === "article" ? "article" : "website",
    },
  };
}

/** Convenience alias */
export const seoToMetadata = wpSeoToMetadata;

/** Legacy alias for backward compat (unused in new code) */
export const setSeoData = wpSeoToMetadata;
