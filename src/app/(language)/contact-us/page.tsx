import { getPageBySlug } from "@/services/wordpress";
import WpPageContentView from "@/views/page/wp-page-content-view";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { seoToMetadata } from "@/lib/utils/seo-utils";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  // URI format required for idType: URI — WordPress expects "/slug/"
  const page = await getPageBySlug("/contact-us/");
  if (!page) return { title: "Contact Us" };

  return seoToMetadata(page.seo, {
    title: `${page.title} — Mekong Smile`,
    description:
      "Contact Mekong Smile for tour inquiries, bookings, and travel support in Vietnam and Southeast Asia.",
  });
}

export default async function ContactUsPage() {
  // URI format required for idType: URI — WordPress expects "/slug/"
  const page = await getPageBySlug("/contact-us/");
  if (!page) notFound();

  return <WpPageContentView page={page} breadcrumbLabel="Liên hệ" />;
}
