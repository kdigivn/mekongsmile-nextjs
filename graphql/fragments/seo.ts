import { gql } from "@apollo/client";

/**
 * Fragment: Rank Math SEO fields
 * Available on: Post, Product (BookingProduct), Page, Category, Destination, etc.
 * Plugin: WPGraphQL for Rank Math SEO
 */
export const SEO_FIELDS = gql`
  fragment SeoFields on RankMathSeo {
    title
    description
    focusKeywords
    robots
    canonicalUrl
    breadcrumbs {
      text
      url
    }
    openGraph {
      title
      description
      url
      type
      siteName
      image {
        url
        width
        height
        type
      }
    }
    jsonLd {
      raw
    }
  }
`;

/**
 * Fragment: Lightweight SEO (for listings where full SEO is overkill)
 */
export const SEO_BASIC_FIELDS = gql`
  fragment SeoBasicFields on RankMathSeo {
    title
    description
    openGraph {
      image {
        url
      }
    }
  }
`;
