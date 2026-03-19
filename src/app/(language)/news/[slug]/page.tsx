import { getAllNews, getNewsBySlug, getNewsBySubcategory } from "@/services/wordpress";
import PostDetailNewView from "@/views/post/post-detail-new/post-detail-new-view";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { seoToMetadata } from "@/lib/utils/seo-utils";
import { safeJsonLd } from "@/lib/utils/jsonld-utils";
import BlogPostsGridView from "@/views/blog/blog-posts-grid-view";

export const revalidate = 3600;
export const dynamicParams = true;

const NEWS_SUBCATEGORIES = new Set(["awards", "csr", "events", "organization"]);

export async function generateStaticParams() {
  try {
    const { nodes } = await getAllNews(100);
    const postSlugs = nodes.map((p) => ({ slug: p.slug }));
    const categorySlugs = [...NEWS_SUBCATEGORIES].map((s) => ({ slug: s }));
    return [...categorySlugs, ...postSlugs];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    if (NEWS_SUBCATEGORIES.has(slug)) {
      const label = slug.charAt(0).toUpperCase() + slug.slice(1);
      return {
        title: `${label} News — Mekong Smile`,
        description: `Latest ${slug} news from Mekong Smile.`,
      };
    }

    const post = await getNewsBySlug(slug);
    if (!post) return {};

    return seoToMetadata(post.seo, {
      title: post.title,
      description: post.excerpt || "",
    });
  } catch {
    return { title: "News — Mekong Smile" };
  }
}

export default async function NewsSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Check if slug is a subcategory (awards, csr, events, organization)
  if (NEWS_SUBCATEGORIES.has(slug)) {
    try {
      const { nodes: posts } = await getNewsBySubcategory(slug, 50);
      const label = slug.charAt(0).toUpperCase() + slug.slice(1);
      return (
        <div className="mx-auto w-full max-w-screen-xl px-4 py-8 md:px-8">
          <h1 className="mb-6 text-3xl font-bold">{label} News</h1>
          <BlogPostsGridView posts={posts} basePath="/news" />
        </div>
      );
    } catch {
      notFound();
    }
  }

  // Otherwise treat as individual news post
  const post = await getNewsBySlug(slug).catch(() => null);
  if (!post) notFound();

  return (
    <>
      <PostDetailNewView post={post} basePath="/news" />
      {(() => {
        const ld = safeJsonLd(post.seo?.jsonLd?.raw);
        return ld ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: ld }}
          />
        ) : null;
      })()}
    </>
  );
}
