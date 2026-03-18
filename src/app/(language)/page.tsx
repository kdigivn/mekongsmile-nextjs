import type { Metadata } from "next";
import Link from "next/link";
import { getAllTours } from "@/services/wordpress/tour-service";
import { getAllBlogPosts } from "@/services/wordpress/post-service";
import { getTourConstant } from "@/services/wordpress/options-service";
import { getAllDestinations } from "@/services/wordpress/taxonomy-service";
import HomePageContent from "./page-content";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Mekong Smile Tours — Authentic Mekong Delta Experiences",
    description:
      "Discover the best tours in the Mekong Delta and Ho Chi Minh City. Floating markets, river cruises, cultural day trips and more with Mekong Smile.",
    alternates: {
      canonical: process.env.NEXT_PUBLIC_BASE_URL
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/`
        : "/",
    },
  };
}

export default async function HomePage() {
  const [toursResult, postsResult, tourConstant, destinations] =
    await Promise.all([
      getAllTours(6),
      getAllBlogPosts(3),
      getTourConstant(),
      getAllDestinations(true),
    ]);

  const tours = toursResult.nodes;
  const posts = postsResult.nodes;

  return (
    <>
      {/* Hero */}
      <div className="relative flex min-h-[400px] w-full flex-col items-center justify-center bg-primary-900 px-4 py-20 text-white">
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Explore the Mekong Delta
          </h1>
          <p className="max-w-xl text-lg text-white/80">
            Authentic day tours, river cruises, and cultural experiences in
            Vietnam&apos;s most vibrant region.
          </p>
          <Link
            href="/tours/"
            className="mt-2 inline-flex items-center rounded-md bg-white px-6 py-3 text-base font-semibold text-primary transition-colors hover:bg-white/90"
          >
            Explore Tours
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto w-full max-w-screen-xl px-4 md:px-8">
        <HomePageContent
          tours={tours}
          posts={posts}
          tourConstant={tourConstant}
          destinations={destinations}
        />
      </div>
    </>
  );
}
