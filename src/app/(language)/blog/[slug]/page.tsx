import { getAllPostSlugs, getPostBySlug } from "@/services/wordpress";
import PostDetailNewView from "@/views/post/post-detail-new/post-detail-new-view";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { seoToMetadata } from "@/lib/utils/seo-utils";
import { safeJsonLd } from "@/lib/utils/jsonld-utils";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return seoToMetadata(post.seo, {
    title: post.title,
    description: post.excerpt || "",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <PostDetailNewView post={post} basePath="/blog" />
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
