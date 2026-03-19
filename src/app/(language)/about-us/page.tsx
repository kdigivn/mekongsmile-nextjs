import { getPageBySlug } from "@/services/wordpress";
import WpPageContentView from "@/views/page/wp-page-content-view";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { seoToMetadata } from "@/lib/utils/seo-utils";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/about-us/");
  if (!page) return { title: "About Us" };

  return seoToMetadata(page.seo, {
    title: `${page.title} — Mekong Smile`,
    description:
      "Learn about Mekong Smile — your trusted local travel partner in Vietnam and Southeast Asia.",
  });
}

export default async function AboutUsPage() {
  // URI format required for idType: URI — WordPress expects "/slug/"
  const page = await getPageBySlug("/about-us/");
  if (!page) notFound();

  return <WpPageContentView page={page} breadcrumbLabel="Về chúng tôi" />;
}
