import { gql } from "@apollo/client";
import { DESTINATION_WITH_CHILDREN_FIELDS } from "../../fragments/taxonomy";

/**
 * Query: Get all destinations (hierarchical tree)
 *
 * Returns top-level parent destinations with their children.
 * Hierarchy: Greater Saigon, Island, Mekong Delta (parents)
 *   → Ho Chi Minh, Tay Ninh, Can Tho, Ben Tre, etc. (children)
 *
 * Note: Uses `allDestination` (NOT `destinations`) — WPGraphQL naming
 * for custom taxonomies registered via WooCommerce.
 *
 * Variables:
 *   $hideEmpty: Boolean = false  — include destinations with 0 products
 */
export const GET_ALL_DESTINATIONS = gql`
  query GetAllDestinations($hideEmpty: Boolean = false) {
    allDestination(
      first: 50
      where: { parent: 0, hideEmpty: $hideEmpty }
    ) {
      nodes {
        ...DestinationWithChildrenFields
      }
    }
  }
  ${DESTINATION_WITH_CHILDREN_FIELDS}
`;

/**
 * Query: Get flat list of all destinations (non-hierarchical)
 * Useful for filters/dropdowns where you need all terms
 */
export const GET_ALL_DESTINATIONS_FLAT = gql`
  query GetAllDestinationsFlat($hideEmpty: Boolean = false) {
    allDestination(first: 50, where: { hideEmpty: $hideEmpty }) {
      nodes {
        databaseId
        name
        slug
        uri
        count
        parentDatabaseId
      }
    }
  }
`;

/**
 * Query: Get single destination by slug with its products and posts
 *
 * For destination archive pages (e.g. /destination/can-tho/)
 * Destination taxonomy is shared between Products AND Posts.
 *
 * Variables:
 *   $slug: ID!           — destination slug
 *   $firstProducts: Int  — products to fetch
 *   $firstPosts: Int     — posts to fetch
 */
export const GET_DESTINATION_BY_SLUG = gql`
  query GetDestinationBySlug(
    $slug: ID!
    $firstProducts: Int = 12
    $firstPosts: Int = 6
  ) {
    destination(id: $slug, idType: SLUG) {
      databaseId
      name
      slug
      uri
      description
      count
      parent {
        node {
          name
          slug
        }
      }
      children(first: 20) {
        nodes {
          name
          slug
          count
        }
      }
      products(first: $firstProducts) {
        nodes {
          ... on BookingProduct {
            databaseId
            name
            slug
            uri
            shortDescription
            featuredImage {
              node {
                sourceUrl
                altText
              }
            }
            shortTourInformation {
              priceInUsd
              priceInVnd
              duration
            }
          }
        }
      }
      posts(first: $firstPosts) {
        nodes {
          databaseId
          title
          slug
          uri
          date
          excerpt
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  }
`;
