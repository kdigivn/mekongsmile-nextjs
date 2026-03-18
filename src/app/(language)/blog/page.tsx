import { getAllBlogPosts, getAllPostCategories } from "@/services/wordpress";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import HeadingBase from "@/components/heading/heading-base";
import BlogPostsGridView from "@/views/blog/blog-posts-grid-view";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest travel tips, guides, and stories from Mekong Smile.",
};

const breadcrumbLinks = [
  { name: "Trang chủ", href: "/" },
  { name: "Blog", href: "/blog/" },
];

export default async function BlogPage() {
  const [postsData, categories] = await Promise.all([
    getAllBlogPosts(24).catch(() => ({ nodes: [], pageInfo: null })),
    getAllPostCategories().catch(() => []),
  ]);
  const posts = postsData.nodes ?? [];

  const filteredCategories = categories.filter(
    (c) => c.slug !== "khong-phan-loai" && c.slug !== "uncategorized"
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="relative bg-primary-50 px-5 py-6 md:px-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          <Breadcrumbs links={breadcrumbLinks} hasBackground={false} />
          <HeadingBase headingTag="h1">Blog</HeadingBase>
          {filteredCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filteredCategories.map((cat) => (
                <a
                  key={cat.databaseId}
                  href={cat.uri ?? `/category/${cat.slug}/`}
                  className="rounded-full border border-primary px-3 py-1 text-sm text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 md:px-10 lg:px-8">
        <BlogPostsGridView posts={posts} basePath="/blog" />
      </div>
    </div>
  );
}
