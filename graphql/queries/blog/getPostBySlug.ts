import { gql } from "@apollo/client";
import { POST_DETAIL_FIELDS } from "../../fragments/post";

/**
 * Query: Get single post by slug
 *
 * For blog/news single article pages.
 * Post URL pattern: /{slug}/ (no /blog/ prefix in current WP setup)
 *
 * Variables:
 *   $slug: ID!  — post slug (e.g. "top-can-tho-restaurants")
 */
export const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ...PostDetailFields
    }
  }
  ${POST_DETAIL_FIELDS}
`;
