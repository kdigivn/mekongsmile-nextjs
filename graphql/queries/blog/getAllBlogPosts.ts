import { gql } from "@apollo/client";
import { POST_CARD_FIELDS } from "../../fragments/post";

/**
 * Query: Get all blog posts with pagination
 *
 * Returns all posts (blog + news combined). ~56 total posts.
 * For filtering by category, use the $categoryName variable.
 *
 * Post categories (hierarchical):
 *   - News (parent) → Awards, CSR, Events, Organization
 *   - Top Destinations
 *   - Toplist
 *   - Travel Guide
 *
 * Variables:
 *   $first: Int = 12
 *   $after: String           — cursor pagination
 *   $categoryName: String    — filter by category slug (e.g. "news", "top-destinations")
 */
export const GET_ALL_BLOG_POSTS = gql`
  query GetAllBlogPosts(
    $first: Int = 12
    $after: String
    $categoryName: String
  ) {
    posts(
      first: $first
      after: $after
      where: { categoryName: $categoryName }
    ) {
      nodes {
        ...PostCardFields
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${POST_CARD_FIELDS}
`;

/**
 * Query: Get all post slugs for static generation
 */
export const GET_ALL_POST_SLUGS = gql`
  query GetAllPostSlugs {
    posts(first: 200) {
      nodes {
        slug
      }
    }
  }
`;

/**
 * Query: Get all post categories
 */
export const GET_ALL_POST_CATEGORIES = gql`
  query GetAllPostCategories {
    categories(first: 50, where: { hideEmpty: true }) {
      nodes {
        databaseId
        name
        slug
        uri
        count
        parent {
          node {
            name
            slug
          }
        }
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
  }
`;
