import { gql } from "@apollo/client";

/**
 * Fragment: Destination taxonomy term
 * Used on Product and Post destination connections
 */
export const DESTINATION_FIELDS = gql`
  fragment DestinationFields on Destination {
    databaseId
    name
    slug
    uri
    count
    description
    parent {
      node {
        databaseId
        name
        slug
      }
    }
  }
`;

/**
 * Fragment: Destination with children (hierarchical)
 * For building destination navigation trees
 */
export const DESTINATION_WITH_CHILDREN_FIELDS = gql`
  fragment DestinationWithChildrenFields on Destination {
    databaseId
    name
    slug
    uri
    count
    description
    children(first: 20) {
      nodes {
        databaseId
        name
        slug
        uri
        count
        description
      }
    }
  }
`;

/**
 * Fragment: Tour Type attribute taxonomy (pa_tour-type)
 * Values: Group Tour, Private Tour
 */
export const TOUR_TYPE_FIELDS = gql`
  fragment TourTypeFields on PaTourType {
    databaseId
    name
    slug
    count
  }
`;

/**
 * Fragment: Travel Style attribute taxonomy (pa_travel-style)
 * Values: Community-based, Culinary, Cultural, Premium River, Sightseeing & Leisure
 */
export const TRAVEL_STYLE_FIELDS = gql`
  fragment TravelStyleFields on PaTravelStyle {
    databaseId
    name
    slug
    count
  }
`;

/**
 * Fragment: Product Tag
 */
export const PRODUCT_TAG_FIELDS = gql`
  fragment ProductTagFields on ProductTag {
    databaseId
    name
    slug
    count
  }
`;

/**
 * Fragment: Post Category (hierarchical)
 * Top-level: News, Top Destinations, Toplist, Travel Guide
 * News children: Awards, CSR, Events, Organization
 */
export const CATEGORY_FIELDS = gql`
  fragment CategoryFields on Category {
    databaseId
    name
    slug
    uri
    count
    parent {
      node {
        databaseId
        name
        slug
      }
    }
  }
`;
