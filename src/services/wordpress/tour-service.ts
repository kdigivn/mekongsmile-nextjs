import { fetchGraphQL } from "@/graphql/client";
import {
  GET_ALL_TOURS,
  GET_ALL_TOUR_SLUGS,
  GET_TOUR_BY_SLUG,
  GET_TOURS_BY_DESTINATION,
  GET_TOURS_BY_TRAVEL_STYLE,
  GET_TOURS_BY_TOUR_TYPE,
  GET_TOURS_BY_TAG,
  GET_TOURS_BY_COMBINED_FILTERS,
} from "@/graphql/queries";
import type {
  GetAllToursResponse,
  GetTourBySlugResponse,
  TourDetail,
} from "@/graphql/types";

/** Paginated tour listing */
export async function getAllTours(first = 12, after?: string) {
  const data = await fetchGraphQL<GetAllToursResponse>(GET_ALL_TOURS, {
    first,
    after,
  });
  return data.products;
}

/** Single tour by slug */
export async function getTourBySlug(slug: string): Promise<TourDetail | null> {
  const data = await fetchGraphQL<GetTourBySlugResponse>(GET_TOUR_BY_SLUG, {
    slug,
  });
  return data.product;
}

/** All tour slugs for static generation */
export async function getAllTourSlugs(): Promise<{ slug: string }[]> {
  const data = await fetchGraphQL<{
    products: { nodes: { slug: string }[] };
  }>(GET_ALL_TOUR_SLUGS);
  return data.products.nodes;
}

/** Tours filtered by destination slugs */
export async function getToursByDestination(
  destinationSlug: string[],
  first = 12,
  after?: string
) {
  const data = await fetchGraphQL<GetAllToursResponse>(
    GET_TOURS_BY_DESTINATION,
    { destinationSlug, first, after }
  );
  return data.products;
}

/** Tours filtered by travel style slugs */
export async function getToursByTravelStyle(
  travelStyleSlug: string[],
  first = 12,
  after?: string
) {
  const data = await fetchGraphQL<GetAllToursResponse>(
    GET_TOURS_BY_TRAVEL_STYLE,
    { travelStyleSlug, first, after }
  );
  return data.products;
}

/** Tours filtered by tour type slugs */
export async function getToursByTourType(
  tourTypeSlug: string[],
  first = 12,
  after?: string
) {
  const data = await fetchGraphQL<GetAllToursResponse>(GET_TOURS_BY_TOUR_TYPE, {
    tourTypeSlug,
    first,
    after,
  });
  return data.products;
}

/** Tours filtered by tag slugs */
export async function getToursByTag(
  tagSlug: string[],
  first = 12,
  after?: string
) {
  const data = await fetchGraphQL<GetAllToursResponse>(GET_TOURS_BY_TAG, {
    tagSlug,
    first,
    after,
  });
  return data.products;
}

/** Tours filtered by combined destination + travel style */
export async function getToursByCombinedFilters(
  destinationSlug: string[],
  travelStyleSlug: string[],
  first = 12,
  after?: string
) {
  const data = await fetchGraphQL<GetAllToursResponse>(
    GET_TOURS_BY_COMBINED_FILTERS,
    { destinationSlug, travelStyleSlug, first, after }
  );
  return data.products;
}
