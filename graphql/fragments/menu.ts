import { gql } from "@apollo/client";

/**
 * Fragment: Menu item fields
 * Supports nested menu items via parentId/parentDatabaseId
 */
export const MENU_ITEM_FIELDS = gql`
  fragment MenuItemFields on MenuItem {
    databaseId
    label
    url
    path
    target
    cssClasses
    parentId
    parentDatabaseId
    order
    connectedNode {
      node {
        ... on Post {
          slug
          uri
        }
        ... on Page {
          slug
          uri
        }
        ... on Product {
          slug
          uri
        }
        ... on Destination {
          slug
          uri
        }
        ... on Category {
          slug
          uri
        }
      }
    }
  }
`;

/**
 * Fragment: Full menu with items
 * Menus: main-menu (PRIMARY), secondary-menu (SECONDARY), top-menu (TOP_BAR_NAV)
 */
export const MENU_FIELDS = gql`
  fragment MenuFields on Menu {
    databaseId
    name
    slug
    locations
    menuItems(first: 100, where: { parentDatabaseId: 0 }) {
      nodes {
        ...MenuItemFields
        childItems(first: 50) {
          nodes {
            ...MenuItemFields
            childItems(first: 20) {
              nodes {
                ...MenuItemFields
              }
            }
          }
        }
      }
    }
  }
  ${MENU_ITEM_FIELDS}
`;
