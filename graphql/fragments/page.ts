import { gql } from "@apollo/client";
import { FEATURED_IMAGE_FIELDS } from "./media";
import { SEO_FIELDS } from "./seo";

/**
 * Fragment: Page fields
 * Pages: homepage, about-us, contact-us, blog, profile, faq,
 *        general-terms-of-use, privacy-policy, shop, cart, checkout, etc.
 */
export const PAGE_FIELDS = gql`
  fragment PageFields on Page {
    databaseId
    title
    slug
    uri
    content
    date
    modified
    featuredImage {
      ...FeaturedImageFields
    }
    template {
      templateName
    }
    isFrontPage
    seo {
      ...SeoFields
    }
  }
  ${FEATURED_IMAGE_FIELDS}
  ${SEO_FIELDS}
`;
