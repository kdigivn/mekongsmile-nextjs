import { gql } from "@apollo/client";
import { TOUR_CARD_FIELDS } from "../../fragments/tour";

/**
 * Query: Get all tours (products) with pagination
 *
 * All 34 products are BookingProduct type (YITH Booking "bookable").
 * Uses cursor-based pagination via WPGraphQL relay spec.
 *
 * Variables:
 *   $first: Int = 12       — items per page
 *   $after: String         — cursor for next page (from pageInfo.endCursor)
 *
 * Usage in Next.js:
 *   const { data } = await client.query({ query: GET_ALL_TOURS, variables: { first: 12 } });
 */
export const GET_ALL_TOURS = gql`
  query GetAllTours($first: Int = 12, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        ...TourCardFields
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${TOUR_CARD_FIELDS}
`;

/**
 * Query: Get all tour slugs for static generation (getStaticPaths)
 *
 * Fetches only slugs — lightweight for build-time path generation.
 * 34 tours total, so single request is sufficient.
 */
export const GET_ALL_TOUR_SLUGS = gql`
  query GetAllTourSlugs {
    products(first: 100) {
      nodes {
        slug
      }
    }
  }
`;
