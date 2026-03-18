import { getAllNews } from "@/services/wordpress";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import HeadingBase from "@/components/heading/heading-base";
import BlogPostsGridView from "@/views/blog/blog-posts-grid-view";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tin tức | Mekong Smile",
  description: "Tin tức mới nhất từ Mekong Smile.",
};

const breadcrumbLinks = [
  { name: "Trang chủ", href: "/" },
  { name: "Tin tức", href: "/news/" },
];

export default async function NewsPage() {
  const postsData = await getAllNews(24).catch(() => ({ nodes: [], pageInfo: null }));
  const posts = postsData.nodes ?? [];

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="relative bg-primary-50 px-5 py-6 md:px-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          <Breadcrumbs links={breadcrumbLinks} hasBackground={false} />
          <HeadingBase headingTag="h1">Tin tức</HeadingBase>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 md:px-10 lg:px-8">
        <BlogPostsGridView posts={posts} basePath="/news" />
      </div>
    </div>
  );
}
