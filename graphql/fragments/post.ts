import { gql } from "@apollo/client";
import { FEATURED_IMAGE_FIELDS } from "./media";
import { CATEGORY_FIELDS, DESTINATION_FIELDS } from "./taxonomy";
import { SEO_FIELDS } from "./seo";

/**
 * Fragment: Post card (listing view)
 * For blog/news grid pages
 */
export const POST_CARD_FIELDS = gql`
  fragment PostCardFields on Post {
    databaseId
    title
    slug
    uri
    date
    modified
    excerpt
    featuredImage {
      ...FeaturedImageFields
    }
    categories {
      nodes {
        ...CategoryFields
      }
    }
    destination {
      nodes {
        ...DestinationFields
      }
    }
  }
  ${FEATURED_IMAGE_FIELDS}
  ${CATEGORY_FIELDS}
  ${DESTINATION_FIELDS}
`;

/**
 * Fragment: Post full detail (single post page)
 */
export const POST_DETAIL_FIELDS = gql`
  fragment PostDetailFields on Post {
    databaseId
    title
    slug
    uri
    date
    modified
    content
    excerpt
    featuredImage {
      ...FeaturedImageFields
    }
    author {
      node {
        name
        slug
        avatar {
          url
        }
      }
    }
    categories {
      nodes {
        ...CategoryFields
      }
    }
    destination {
      nodes {
        ...DestinationFields
      }
    }
    tags {
      nodes {
        name
        slug
      }
    }
    seo {
      ...SeoFields
    }
  }
  ${FEATURED_IMAGE_FIELDS}
  ${CATEGORY_FIELDS}
  ${DESTINATION_FIELDS}
  ${SEO_FIELDS}
`;
