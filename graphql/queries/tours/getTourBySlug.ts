import { gql } from "@apollo/client";
import { TOUR_DETAIL_FIELDS } from "../../fragments/tour";

/**
 * Query: Get single tour by slug
 *
 * Returns full tour detail including ACF fields, gallery, taxonomies.
 * Product URL pattern: /product/{slug}/
 *
 * Variables:
 *   $slug: ID!  — tour product slug (e.g. "cai-rang-floating-market-tour")
 *
 * Usage in Next.js:
 *   const { data } = await client.query({
 *     query: GET_TOUR_BY_SLUG,
 *     variables: { slug: params.slug }
 *   });
 */
export const GET_TOUR_BY_SLUG = gql`
  query GetTourBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      ...TourDetailFields
    }
  }
  ${TOUR_DETAIL_FIELDS}
`;
