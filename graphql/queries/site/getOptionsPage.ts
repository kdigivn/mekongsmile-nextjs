import { gql } from "@apollo/client";

/**
 * Query: Get Tour Constant options page data
 *
 * ACF Options Page: "Tour Constant"
 * GraphQL Type Name: TourConstantOptions (renamed from TOURCONSTANT to avoid conflict)
 * Root query field: tourConstantOptions
 *
 * Contains:
 *   - whyChooseUs: repeater with headline + description (6 items)
 */
export const GET_TOUR_CONSTANT = gql`
  query GetTourConstant {
    tourConstantOptions {
      tourConstant {
        whyChooseUs {
          headline
          description
        }
      }
    }
  }
`;
