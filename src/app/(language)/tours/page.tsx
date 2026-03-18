import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getAllTours,
  getToursByDestination,
  getToursByTravelStyle,
  getToursByTourType,
  getToursByCombinedFilters,
  getTourFilterOptions,
} from "@/services/wordpress";
import TourListingView from "@/views/tour/tour-listing-view";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Tours — Mekong Smile",
  description:
    "Browse all our Mekong Delta tours, floating market day trips, river cruises, and cultural experiences.",
};

interface PageProps {
  searchParams: Promise<{
    destination?: string;
    type?: string;
    style?: string;
    q?: string;
    after?: string;
  }>;
}

export default async function ToursPage({ searchParams }: PageProps) {
  const { destination, type, style, after, q } = await searchParams;

  const [filterOptions, toursData] = await Promise.all([
    getTourFilterOptions().catch(() => null),
    (destination && style
      ? getToursByCombinedFilters([destination], [style], 50, after)
      : destination
        ? getToursByDestination([destination], 50, after)
        : type
          ? getToursByTourType([type], 50, after)
          : style
            ? getToursByTravelStyle([style], 50, after)
            : getAllTours(50, after)
    ).catch(() => null),
  ]);

  const destinations = filterOptions?.allDestination?.nodes ?? [];
  const tourTypes = filterOptions?.allPaTourType?.nodes ?? [];
  const travelStyles = filterOptions?.allPaTravelStyle?.nodes ?? [];

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-8 md:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Tours</h1>
        <p className="mt-2 text-muted-foreground">
          Discover our handpicked tours across the Mekong Delta region.
        </p>
      </div>

      <Suspense>
        <TourListingView
          initialTours={toursData?.nodes ?? []}
          initialPageInfo={
            toursData?.pageInfo ?? {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            }
          }
          filterOptions={{ destinations, tourTypes, travelStyles }}
          activeFilters={{ destination, type, style, q }}
        />
      </Suspense>
    </div>
  );
}
