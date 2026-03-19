import { gql } from "@apollo/client";
import { FEATURED_IMAGE_FIELDS, GALLERY_IMAGES_FIELDS, MEDIA_ITEM_FIELDS } from "./media";
import { DESTINATION_FIELDS, TOUR_TYPE_FIELDS, TRAVEL_STYLE_FIELDS, PRODUCT_TAG_FIELDS } from "./taxonomy";
import { SEO_FIELDS } from "./seo";

/**
 * Fragment: ACF "Short Tour Information" fields
 * Field group registered on BookingProduct (YITH Booking product type)
 * GraphQL type name: ShortTourInformation
 */
export const SHORT_TOUR_INFORMATION_FIELDS = gql`
  fragment ShortTourInformationFields on ShortTourInformation {
    priceInUsd
    priceInVnd
    duration
    language
    bestTimeToVisit
    destinations
    tripadvisorLink
    highlights
    additionalInfo
    pricingTable
    faq {
      question
      answer
    }
    includes {
      included
      excluded
    }
    meetingPickup {
      pickupPoint
      startTime
      pickupDetails
      linkGoogleMaps
    }
    attachment {
      node {
        ...MediaItemFields
      }
    }
  }
  ${MEDIA_ITEM_FIELDS}
`;

/**
 * Fragment: Tour card (listing view)
 * Lightweight fields for tour grid/list pages
 * All 34 products are BookingProduct type (YITH Booking "bookable")
 */
export const TOUR_CARD_FIELDS = gql`
  fragment TourCardFields on Product {
    databaseId
    name
    slug
    uri
    shortDescription
    featuredImage {
      ...FeaturedImageFields
    }
    destination {
      nodes {
        ...DestinationFields
      }
    }
    allPaTourType {
      nodes {
        ...TourTypeFields
      }
    }
    allPaTravelStyle {
      nodes {
        ...TravelStyleFields
      }
    }
    productTags {
      nodes {
        ...ProductTagFields
      }
    }
    averageRating
    reviewCount
    ... on BookingProduct {
      shortTourInformation {
        priceInUsd
        priceInVnd
        duration
        highlights
      }
    }
  }
  ${FEATURED_IMAGE_FIELDS}
  ${DESTINATION_FIELDS}
  ${TOUR_TYPE_FIELDS}
  ${TRAVEL_STYLE_FIELDS}
  ${PRODUCT_TAG_FIELDS}
`;

/**
 * Fragment: Tour full detail (single tour page)
 * Complete fields including gallery, ACF data, full description
 */
export const TOUR_DETAIL_FIELDS = gql`
  fragment TourDetailFields on Product {
    databaseId
    name
    slug
    uri
    shortDescription
    description
    content
    featuredImage {
      ...FeaturedImageFields
    }
    galleryImages(first: 20) {
      ...GalleryImagesFields
    }
    image {
      ...MediaItemFields
    }
    destination {
      nodes {
        ...DestinationFields
      }
    }
    allPaTourType {
      nodes {
        ...TourTypeFields
      }
    }
    allPaTravelStyle {
      nodes {
        ...TravelStyleFields
      }
    }
    productTags {
      nodes {
        ...ProductTagFields
      }
    }
    ... on BookingProduct {
      shortTourInformation {
        ...ShortTourInformationFields
      }
    }
    seo {
      ...SeoFields
    }
  }
  ${FEATURED_IMAGE_FIELDS}
  ${GALLERY_IMAGES_FIELDS}
  ${MEDIA_ITEM_FIELDS}
  ${DESTINATION_FIELDS}
  ${TOUR_TYPE_FIELDS}
  ${TRAVEL_STYLE_FIELDS}
  ${PRODUCT_TAG_FIELDS}
  ${SHORT_TOUR_INFORMATION_FIELDS}
  ${SEO_FIELDS}
`;
