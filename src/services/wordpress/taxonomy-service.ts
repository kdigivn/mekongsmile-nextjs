import { fetchGraphQL } from "@/graphql/client";
import {
  GET_ALL_DESTINATIONS,
  GET_ALL_DESTINATIONS_FLAT,
  GET_DESTINATION_BY_SLUG,
  GET_ALL_TOUR_TYPES,
  GET_ALL_TRAVEL_STYLES,
  GET_ALL_PRODUCT_TAGS,
  GET_TOUR_FILTER_OPTIONS,
} from "@/graphql/queries";
import type {
  GetAllDestinationsResponse,
  GetDestinationBySlugResponse,
  GetTourFilterOptionsResponse,
  Destination,
  TourType,
  TravelStyle,
  ProductTag,
} from "@/graphql/types";

/** Hierarchical destination tree (parent → children) */
export async function getAllDestinations(
  hideEmpty = false
): Promise<Destination[]> {
  const data = await fetchGraphQL<GetAllDestinationsResponse>(
    GET_ALL_DESTINATIONS,
    { hideEmpty }
  );
  return data.allDestination.nodes;
}

/** Flat destination list with parentDatabaseId */
export async function getAllDestinationsFlat(
  hideEmpty = false
): Promise<Destination[]> {
  const data = await fetchGraphQL<GetAllDestinationsResponse>(
    GET_ALL_DESTINATIONS_FLAT,
    { hideEmpty }
  );
  return data.allDestination.nodes;
}

/** Single destination with its tours and posts */
export async function getDestinationBySlug(
  slug: string,
  firstProducts = 12,
  firstPosts = 6
) {
  const data = await fetchGraphQL<GetDestinationBySlugResponse>(
    GET_DESTINATION_BY_SLUG,
    { slug, firstProducts, firstPosts }
  );
  return data.destination;
}

/** All tour types (group-tour, private-tour) */
export async function getAllTourTypes(): Promise<TourType[]> {
  const data = await fetchGraphQL<{
    allPaTourType: { nodes: TourType[] };
  }>(GET_ALL_TOUR_TYPES);
  return data.allPaTourType.nodes;
}

/** All travel styles */
export async function getAllTravelStyles(): Promise<TravelStyle[]> {
  const data = await fetchGraphQL<{
    allPaTravelStyle: { nodes: TravelStyle[] };
  }>(GET_ALL_TRAVEL_STYLES);
  return data.allPaTravelStyle.nodes;
}

/** All product tags */
export async function getAllProductTags(): Promise<ProductTag[]> {
  const data = await fetchGraphQL<{
    productTags: { nodes: ProductTag[] };
  }>(GET_ALL_PRODUCT_TAGS);
  return data.productTags.nodes;
}

/** All filter options in one query (destinations, tour types, travel styles, tags) */
export async function getTourFilterOptions(): Promise<GetTourFilterOptionsResponse> {
  return fetchGraphQL<GetTourFilterOptionsResponse>(GET_TOUR_FILTER_OPTIONS);
}
