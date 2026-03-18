import { gql } from "@apollo/client";
import { MENU_FIELDS } from "../../fragments/menu";

/**
 * Query: Get all navigation menus
 *
 * Registered menus:
 *   - main-menu → locations: PRIMARY, PRIMARY_MOBILE
 *   - secondary-menu → location: SECONDARY
 *   - top-menu → location: TOP_BAR_NAV
 *
 * Returns 3-level nested menu items with connected node references.
 */
export const GET_ALL_MENUS = gql`
  query GetAllMenus {
    menus {
      nodes {
        ...MenuFields
      }
    }
  }
  ${MENU_FIELDS}
`;

/**
 * Query: Get menu by location
 *
 * Variables:
 *   $location: MenuLocationEnum!  — PRIMARY, SECONDARY, TOP_BAR_NAV, PRIMARY_MOBILE
 */
export const GET_MENU_BY_LOCATION = gql`
  query GetMenuByLocation($location: MenuLocationEnum!) {
    menus(where: { location: $location }) {
      nodes {
        ...MenuFields
      }
    }
  }
  ${MENU_FIELDS}
`;
