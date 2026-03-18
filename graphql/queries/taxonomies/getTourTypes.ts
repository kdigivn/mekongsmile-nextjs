import { gql } from "@apollo/client";

/**
 * Query: Get all tour types (pa_tour-type WooCommerce attribute)
 *
 * Values: Group Tour, Private Tour
 * Uses `allPaTourType` root query.
 */
export const GET_ALL_TOUR_TYPES = gql`
  query GetAllTourTypes {
    allPaTourType(first: 20) {
      nodes {
        databaseId
        name
        slug
        count
      }
    }
  }
`;

/**
 * Query: Get all travel styles (pa_travel-style WooCommerce attribute)
 *
 * Values: Community-based tours, Culinary tours, Cultural tours,
 *         Premium River Excursions, Sightseeing & Leisure Tours
 * Uses `allPaTravelStyle` root query.
 */
export const GET_ALL_TRAVEL_STYLES = gql`
  query GetAllTravelStyles {
    allPaTravelStyle(first: 20) {
      nodes {
        databaseId
        name
        slug
        count
      }
    }
  }
`;

/**
 * Query: Get all product tags
 *
 * Tags used for tour collections: Must-try Mekong Delta Tours,
 * Recommended Can Tho Tours, Heritage Crafts, etc.
 */
export const GET_ALL_PRODUCT_TAGS = gql`
  query GetAllProductTags {
    productTags(first: 50) {
      nodes {
        databaseId
        name
        slug
        count
      }
    }
  }
`;

/**
 * Query: Combined filter options for tour search/filter UI
 *
 * Single query to fetch all taxonomy terms needed for filter sidebar.
 */
export const GET_TOUR_FILTER_OPTIONS = gql`
  query GetTourFilterOptions {
    allDestination(first: 50, where: { hideEmpty: false, parent: 0 }) {
      nodes {
        databaseId
        name
        slug
        count
        children(first: 20) {
          nodes {
            databaseId
            name
            slug
            count
          }
        }
      }
    }
    allPaTourType(first: 20) {
      nodes {
        databaseId
        name
        slug
        count
      }
    }
    allPaTravelStyle(first: 20) {
      nodes {
        databaseId
        name
        slug
        count
      }
    }
    productTags(first: 50) {
      nodes {
        databaseId
        name
        slug
        count
      }
    }
  }
`;
