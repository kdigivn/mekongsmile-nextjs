import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllDestinations,
  getDestinationBySlug,
} from "@/services/wordpress/taxonomy-service";
import DestinationView from "@/views/destination/destination-view";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const destinations = await getAllDestinations();
    const slugs: { slug: string }[] = [];
    for (const dest of destinations) {
      slugs.push({ slug: dest.slug });
      if (dest.children?.nodes) {
        for (const child of dest.children.nodes) {
          slugs.push({ slug: child.slug });
        }
      }
    }
    return slugs;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const destination = await getDestinationBySlug(slug);
    if (!destination) return { title: "Destination Not Found" };

    return {
      title: `${destination.name} Tours — Mekong Smile`,
      description:
        destination.description ??
        `Explore tours and travel guides for ${destination.name} with Mekong Smile.`,
    };
  } catch {
    return { title: "Destination — Mekong Smile" };
  }
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  let destination;
  try {
    destination = await getDestinationBySlug(slug, 12, 6);
  } catch (error) {
    console.error(`[Destination] Failed to fetch ${slug}:`, error);
  }
  if (!destination) notFound();

  return <DestinationView destination={destination} />;
}
