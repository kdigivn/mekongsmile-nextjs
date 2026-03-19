import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllTourSlugs,
  getTourBySlug,
} from "@/services/wordpress/tour-service";
import TourDetailView from "@/views/tour/tour-detail-view";
import { seoToMetadata } from "@/lib/utils/seo-utils";
import { safeJsonLd } from "@/lib/utils/jsonld-utils";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const slugs = await getAllTourSlugs();
    return slugs.map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const tour = await getTourBySlug(slug);
    if (!tour) return { title: "Tour Not Found" };

    const price = tour.shortTourInformation?.priceInUsd;
    const duration = tour.shortTourInformation?.duration;
    const fallbackDescription = `${tour.name}${duration ? ` — ${duration}` : ""}${price ? ` from $${price} USD` : ""}. Book now with Mekong Smile.`;

    return seoToMetadata(tour.seo, {
      title: `${tour.name} — Mekong Smile`,
      description: fallbackDescription,
    });
  } catch {
    return { title: "Tour — Mekong Smile" };
  }
}

export default async function TourPage({ params }: Props) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  return (
    <>
      <TourDetailView tour={tour} />
      {(() => {
        const ld = safeJsonLd(tour.seo?.jsonLd?.raw);
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
