import { getPageBySlug } from "@/services/wordpress";
import WpPageContentView from "@/views/page/wp-page-content-view";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { seoToMetadata } from "@/lib/utils/seo-utils";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPageBySlug("/contact-us/");
    if (!page) return { title: "Contact Us — Mekong Smile" };
    return seoToMetadata(page.seo, {
      title: `${page.title} — Mekong Smile`,
      description:
        "Contact Mekong Smile for tour inquiries, bookings, and travel support.",
    });
  } catch {
    return { title: "Contact Us — Mekong Smile" };
  }
}

export default async function ContactUsPage() {
  const page = await getPageBySlug("/contact-us/").catch(() => null);
  if (!page) notFound();
  return <WpPageContentView page={page} breadcrumbLabel="Contact Us" />;
}
