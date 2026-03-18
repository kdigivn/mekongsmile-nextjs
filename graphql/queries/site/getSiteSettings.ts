import { gql } from "@apollo/client";

/**
 * Query: Get WordPress general settings
 *
 * Returns: title="Mekong Smile", description="Signature Mekong Delta Tour",
 *          url="https://mekongsmile.com"
 *
 * NOTE: ACF Options page "Tour Constant" (tourConstant → whyChooseUs)
 * is NOT yet queryable via GraphQL. The ACF Options page type is registered
 * but the root query field is not exposed.
 *
 * TODO: Install wp-graphql-acf-options or register the options page
 * query manually in functions.php to expose tourConstant data.
 */
export const GET_SITE_SETTINGS = gql`
  query GetSiteSettings {
    generalSettings {
      title
      description
      url
      language
    }
  }
`;

/**
 * Query: Combined site-wide data for _app.tsx or layout
 *
 * Fetches settings + all menus in a single request for the layout shell.
 * Menus:
 *   - main-menu (PRIMARY / PRIMARY_MOBILE) — destination mega menu
 *   - secondary-menu (SECONDARY) — tour categories
 *   - top-menu (TOP_BAR_NAV) — hotline, whatsapp
 */
export const GET_LAYOUT_DATA = gql`
  query GetLayoutData {
    generalSettings {
      title
      description
      url
    }
    menus {
      nodes {
        databaseId
        name
        slug
        locations
        menuItems(first: 100, where: { parentDatabaseId: 0 }) {
          nodes {
            databaseId
            label
            url
            path
            target
            parentId
            parentDatabaseId
            cssClasses
            connectedNode {
              node {
                ... on Page {
                  slug
                  uri
                }
                ... on Destination {
                  slug
                  uri
                }
              }
            }
            childItems(first: 50) {
              nodes {
                databaseId
                label
                url
                path
                target
                parentId
                parentDatabaseId
                childItems(first: 20) {
                  nodes {
                    databaseId
                    label
                    url
                    path
                    target
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
