import { getPageBySlug } from "@/services/wordpress";
import WpPageContentView from "@/views/page/wp-page-content-view";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { seoToMetadata } from "@/lib/utils/seo-utils";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPageBySlug("/about-us/");
    if (!page) return { title: "About Us — Mekong Smile" };
    return seoToMetadata(page.seo, {
      title: `${page.title} — Mekong Smile`,
      description:
        "Learn about Mekong Smile — your trusted local travel partner in Vietnam.",
    });
  } catch {
    return { title: "About Us — Mekong Smile" };
  }
}

export default async function AboutUsPage() {
  const page = await getPageBySlug("/about-us/").catch(() => null);
  if (!page) notFound();
  return <WpPageContentView page={page} breadcrumbLabel="About Us" />;
}
