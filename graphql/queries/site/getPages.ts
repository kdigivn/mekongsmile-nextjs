import { gql } from "@apollo/client";
import { PAGE_FIELDS } from "../../fragments/page";

/**
 * Query: Get all pages
 *
 * Key pages: homepage, about-us, contact-us, blog,
 *            profile, faq, general-terms-of-use, privacy-policy
 * WooCommerce pages: shop, cart, checkout, my-account, wishlist
 */
export const GET_ALL_PAGES = gql`
  query GetAllPages {
    pages(first: 50) {
      nodes {
        databaseId
        title
        slug
        uri
        template {
          templateName
        }
        isFrontPage
      }
    }
  }
`;

/**
 * Query: Get single page by slug
 *
 * Variables:
 *   $slug: ID!  — page slug (e.g. "about-us")
 *
 * Note: Uses URI idType because some pages have nested URIs.
 * For top-level pages, slug and URI are equivalent.
 */
export const GET_PAGE_BY_SLUG = gql`
  query GetPageBySlug($slug: ID!) {
    page(id: $slug, idType: URI) {
      ...PageFields
    }
  }
  ${PAGE_FIELDS}
`;

/**
 * Query: Get all page slugs for static generation
 */
export const GET_ALL_PAGE_SLUGS = gql`
  query GetAllPageSlugs {
    pages(first: 50) {
      nodes {
        slug
        uri
      }
    }
  }
`;
