import { gql } from "@apollo/client";
import { TOUR_CARD_FIELDS } from "../../fragments/tour";

/**
 * Query: Get tours filtered by destination taxonomy
 *
 * Uses WooGraphQL taxonomyFilter on products connection.
 * Taxonomy field name: DESTINATION (mapped from "destination" custom taxonomy).
 *
 * Variables:
 *   $destinationSlug: [String!]  — e.g. ["can-tho"], ["ho-chi-minh"]
 *   $first: Int = 12
 *   $after: String
 *
 * Usage:
 *   variables: { destinationSlug: ["can-tho"], first: 12 }
 */
export const GET_TOURS_BY_DESTINATION = gql`
  query GetToursByDestination(
    $destinationSlug: [String!]
    $first: Int = 12
    $after: String
  ) {
    products(
      first: $first
      after: $after
      where: {
        taxonomyFilter: {
          filters: [
            { taxonomy: DESTINATION, terms: $destinationSlug }
          ]
        }
      }
    ) {
      nodes {
        ...TourCardFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${TOUR_CARD_FIELDS}
`;

/**
 * Query: Get tours filtered by travel style (pa_travel-style)
 *
 * Travel styles: community-based-tours, culinary-tours, cultural-tours,
 *                premium-river-excursions, sightseeing-leisure-tours
 *
 * Variables:
 *   $travelStyleSlug: [String!]  — e.g. ["culinary-tours"]
 *   $first: Int = 12
 *   $after: String
 */
export const GET_TOURS_BY_TRAVEL_STYLE = gql`
  query GetToursByTravelStyle(
    $travelStyleSlug: [String!]
    $first: Int = 12
    $after: String
  ) {
    products(
      first: $first
      after: $after
      where: {
        taxonomyFilter: {
          filters: [
            { taxonomy: PATRAVELSTYLE, terms: $travelStyleSlug }
          ]
        }
      }
    ) {
      nodes {
        ...TourCardFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${TOUR_CARD_FIELDS}
`;

/**
 * Query: Get tours filtered by tour type (pa_tour-type)
 *
 * Tour types: group-tour, private-tour
 *
 * Variables:
 *   $tourTypeSlug: [String!]  — e.g. ["private-tour"]
 *   $first: Int = 12
 *   $after: String
 */
export const GET_TOURS_BY_TOUR_TYPE = gql`
  query GetToursByTourType(
    $tourTypeSlug: [String!]
    $first: Int = 12
    $after: String
  ) {
    products(
      first: $first
      after: $after
      where: {
        taxonomyFilter: {
          filters: [
            { taxonomy: PATOURTYPE, terms: $tourTypeSlug }
          ]
        }
      }
    ) {
      nodes {
        ...TourCardFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${TOUR_CARD_FIELDS}
`;

/**
 * Query: Get tours filtered by product tag
 *
 * Tags: heritage-crafts-and-artisan-villages, must-try-mekong-delta-tours,
 *       recommended-can-tho-tours, river-and-islet-experiences, etc.
 *
 * Variables:
 *   $tagSlug: [String!]  — e.g. ["must-try-mekong-delta-tours"]
 *   $first: Int = 12
 *   $after: String
 */
export const GET_TOURS_BY_TAG = gql`
  query GetToursByTag(
    $tagSlug: [String!]
    $first: Int = 12
    $after: String
  ) {
    products(
      first: $first
      after: $after
      where: {
        taxonomyFilter: {
          filters: [
            { taxonomy: PRODUCTTAG, terms: $tagSlug }
          ]
        }
      }
    ) {
      nodes {
        ...TourCardFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${TOUR_CARD_FIELDS}
`;

/**
 * Query: Get tours with combined taxonomy filters
 *
 * Example: destination=can-tho AND travel-style=culinary-tours
 * Uses AND relation between filters by default.
 *
 * Variables:
 *   $destinationSlug: [String!]
 *   $travelStyleSlug: [String!]
 *   $first: Int = 12
 *   $after: String
 */
export const GET_TOURS_BY_COMBINED_FILTERS = gql`
  query GetToursByCombinedFilters(
    $destinationSlug: [String!]
    $travelStyleSlug: [String!]
    $first: Int = 12
    $after: String
  ) {
    products(
      first: $first
      after: $after
      where: {
        taxonomyFilter: {
          relation: AND
          filters: [
            { taxonomy: DESTINATION, terms: $destinationSlug }
            { taxonomy: PATRAVELSTYLE, terms: $travelStyleSlug }
          ]
        }
      }
    ) {
      nodes {
        ...TourCardFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${TOUR_CARD_FIELDS}
`;
