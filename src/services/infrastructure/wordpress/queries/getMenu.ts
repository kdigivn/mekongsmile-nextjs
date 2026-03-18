import { graphqlFetcher } from "@/services/graphql/fetcher";
import { Menu, Menus } from "../types/menu";
import { MenuLocationEnum } from "../enums/menu-locations";

/**
 * Fetch a menu items by slug.
 */
export async function getMenuItemsBySlug(slug: string) {
  const query = `
      query GetMenuBySlug($slug: ID = "URI") {
        menu(id: $slug, idType: SLUG) {
          menuItems {
            edges {
              node {
                uri
                label
                databaseId
              }
            }
          }
        }
      }
    `;

  const variables = {
    slug: slug,
  };

  const response = await graphqlFetcher<Menu>(query, variables);

  return response.data?.menu;
}

/**
 * Fetch a menu items by name.
 */
export async function getMenuItemsByName(name: string) {
  const query = `
          fragment ChildItemFields on MenuItem {
          id
          label
          path
          parentId
        }

        query MyQuery {
          menu(id: "${name}", idType: NAME) {
            menuItems (first: 100){
              nodes {
                ...ChildItemFields
                childItems {
                  nodes {
                    ...ChildItemFields
                    childItems {
                      nodes {
                        ...ChildItemFields
                        childItems{
                          nodes{
                            ...ChildItemFields
                          }
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
  const response = await graphqlFetcher<Menu>(query);
  return response?.data || [];
}

/**
 * Fetch a menu items by id.
 */
export async function getMenuItemsById(id: number) {
  const query = `
          fragment ChildItemFields on MenuItem {
          id
          label
          path
          parentId
        }

        query MyQuery {
          menu(id: ${id}, idType: DATABASE_ID) {
            menuItems (first: 100){
              nodes {
                ...ChildItemFields
                childItems {
                  nodes {
                    ...ChildItemFields
                    childItems {
                      nodes {
                        ...ChildItemFields
                        childItems{
                          nodes{
                            ...ChildItemFields
                          }
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
  const response = await graphqlFetcher<Menu>(query);
  return response?.data || [];
}

/**
 * Fetch a menu items by id. This is the header menu items.
 * Limited to 20 items for each level of the menu.
 */
export async function getMenuItemsByLocation(location: MenuLocationEnum) {
  const query = `
          fragment ChildItemFields on MenuItem {
          id
          label
          path
          uri
          parentId
        }

        query MyQuery2 {
        menus(where: {location: ${location}}) {
          nodes {
            menuItems(first: 20,  where: {parentId: 0}) {
              nodes {
                ...ChildItemFields
                childItems(first: 20) {
                  nodes {
                    ...ChildItemFields
                    childItems {
                      nodes {
                        ...ChildItemFields
                        childItems {
                          nodes {
                            ...ChildItemFields
                          }
                        }
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
  const response = await graphqlFetcher<Menus>(query);
  return response?.data || [];
}

export async function getFooterMenuLocation() {
  const query = `
          fragment ChildItemFields on MenuItem {
          id
          label
          path
          parentId
        }

        query MyQuery2 {
          menus(where: {location: FOOTER_MENU}) {
            nodes {
              menuItems(first: 100, where: {parentId: 0}) {
                nodes {
                  ...ChildItemFields
                  childItems {
                    nodes {
                      ...ChildItemFields
                      childItems {
                        nodes {
                          ...ChildItemFields
                          childItems {
                            nodes {
                              ...ChildItemFields
                            }
                          }
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
  const response = await graphqlFetcher<Menus>(query);
  return response?.data || [];
}
