import { gql } from "@apollo/client";
import { POST_CARD_FIELDS } from "../../fragments/post";

/**
 * Query: Get news posts (category "news" and children)
 *
 * News is a parent category containing: Awards, CSR, Events, Organization
 * Using categoryName: "news" fetches posts from News + all children.
 *
 * Variables:
 *   $first: Int = 12
 *   $after: String
 */
export const GET_ALL_NEWS = gql`
  query GetAllNews($first: Int = 12, $after: String) {
    posts(
      first: $first
      after: $after
      where: { categoryName: "news" }
    ) {
      nodes {
        ...PostCardFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${POST_CARD_FIELDS}
`;

/**
 * Query: Get news by subcategory
 *
 * Variables:
 *   $subcategory: String  — "awards", "csr", "events", "organization"
 *   $first: Int = 12
 *   $after: String
 */
export const GET_NEWS_BY_SUBCATEGORY = gql`
  query GetNewsBySubcategory(
    $subcategory: String!
    $first: Int = 12
    $after: String
  ) {
    posts(
      first: $first
      after: $after
      where: { categoryName: $subcategory }
    ) {
      nodes {
        ...PostCardFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${POST_CARD_FIELDS}
`;

/**
 * Query: Get single news post by slug
 * Re-uses GET_POST_BY_SLUG — news and blog posts use the same Post type.
 * Exported separately for semantic clarity in Next.js pages.
 */
export { GET_POST_BY_SLUG as GET_NEWS_BY_SLUG } from "./getPostBySlug";
