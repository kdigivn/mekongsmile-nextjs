import { gql } from "@apollo/client";

/**
 * Fragment: Media/Image fields
 * Reusable across products, posts, pages
 */
export const MEDIA_ITEM_FIELDS = gql`
  fragment MediaItemFields on MediaItem {
    sourceUrl
    altText
    title
    mediaDetails {
      width
      height
    }
  }
`;

/**
 * Fragment: Featured Image connection edge
 * Used on Post, Page, Product types
 */
export const FEATURED_IMAGE_FIELDS = gql`
  fragment FeaturedImageFields on NodeWithFeaturedImageToMediaItemConnectionEdge {
    node {
      ...MediaItemFields
    }
  }
  ${MEDIA_ITEM_FIELDS}
`;

/**
 * Fragment: Gallery images for products
 */
export const GALLERY_IMAGES_FIELDS = gql`
  fragment GalleryImagesFields on ProductToMediaItemConnection {
    nodes {
      ...MediaItemFields
    }
  }
  ${MEDIA_ITEM_FIELDS}
`;
