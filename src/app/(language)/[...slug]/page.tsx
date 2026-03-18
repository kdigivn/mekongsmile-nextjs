/**
 * Catch-all route for WordPress pages (FAQ, terms, privacy, etc.)
 *
 * Dedicated routes exist for:
 *   - Blog posts: /blog/[slug]/
 *   - News: /news/[slug]/
 *   - Tours: /tours/[slug]/
 *   - About Us: /about-us/
 *   - Contact Us: /contact-us/
 *
 * This route handles remaining WP pages by URI.
 */

import { getAllPageSlugs, getPageBySlug } from "@/services/wordpress";
import WpPageContentView from "@/views/page/wp-page-content-view";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamicParams = true;
export const revalidate = 3600;

// Slugs to exclude — these have dedicated routes
const EXCLUDED_SLUGS = new Set([
  "blog",
  "news",
  "about-us",
  "contact-us",
  "booking",
  "transactions",
]);

export async function generateStaticParams() {
  const pages = await getAllPageSlugs();

  return pages
    .filter((p) => !EXCLUDED_SLUGS.has(p.slug))
    .map((p) => ({
      slug: (p.uri ?? `/${p.slug}/`).split("/").filter((s) => s !== ""),
    }))
    .filter((p) => p.slug.length > 0);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string[] };
}): Promise<Metadata> {
  const uri = `/${params.slug.join("/")}/`;
  const page = await getPageBySlug(uri);
  if (!page) return {};

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || undefined,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL || ""}${uri}`,
    },
  };
}

export default async function CatchAllPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const uri = `/${params.slug.join("/")}/`;
  const page = await getPageBySlug(uri);

  if (!page) notFound();

  return <WpPageContentView page={page} />;
}
