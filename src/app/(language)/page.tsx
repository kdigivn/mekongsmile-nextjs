import type { Metadata } from "next";
import { getAllTours } from "@/services/wordpress/tour-service";
import { getAllBlogPosts } from "@/services/wordpress/post-service";
import { getTourConstant } from "@/services/wordpress/options-service";
import { getAllDestinations } from "@/services/wordpress/taxonomy-service";
import HomePageContent from "./page-content";
import HeroSection from "@/views/homepage/hero-section";
import TrustBar from "@/views/homepage/trust-bar";
import CtaBanner from "@/views/homepage/cta-banner";

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
      getAllTours(6).catch(() => ({ nodes: [], pageInfo: null })),
      getAllBlogPosts(3).catch(() => ({ nodes: [], pageInfo: null })),
      getTourConstant().catch(() => null),
      getAllDestinations(true).catch(() => []),
    ]);

  const tours = toursResult?.nodes ?? [];
  const posts = postsResult?.nodes ?? [];

  return (
    <>
      <HeroSection />
      <TrustBar />

      {/* Main content */}
      <div className="mx-auto w-full max-w-screen-xl px-4 md:px-8">
        <HomePageContent
          tours={tours}
          posts={posts}
          tourConstant={tourConstant}
          destinations={destinations}
        />
      </div>

      <CtaBanner />
    </>
  );
}
