import { fetchGraphQL } from "@/graphql/client";
import {
  GET_SITE_SETTINGS,
  GET_LAYOUT_DATA,
  GET_ALL_MENUS,
  GET_MENU_BY_LOCATION,
} from "@/graphql/queries";
import type {
  GetSiteSettingsResponse,
  GetLayoutDataResponse,
  GetAllMenusResponse,
  GeneralSettings,
  Menu,
} from "@/graphql/types";

/** Site title, description, URL, language */
export async function getSiteSettings(): Promise<GeneralSettings> {
  const data = await fetchGraphQL<GetSiteSettingsResponse>(GET_SITE_SETTINGS);
  return data.generalSettings;
}

/** Settings + all menus in one query (for root layout) */
export async function getLayoutData(): Promise<GetLayoutDataResponse> {
  return fetchGraphQL<GetLayoutDataResponse>(GET_LAYOUT_DATA);
}

/** All 3 menus with nested items */
export async function getAllMenus(): Promise<Menu[]> {
  const data = await fetchGraphQL<GetAllMenusResponse>(GET_ALL_MENUS);
  return data.menus.nodes;
}

/** Single menu by location: PRIMARY, SECONDARY, TOP_BAR_NAV */
export async function getMenuByLocation(
  location: string
): Promise<Menu | null> {
  const data = await fetchGraphQL<{ menus: { nodes: Menu[] } }>(
    GET_MENU_BY_LOCATION,
    { location }
  );
  return data.menus.nodes[0] ?? null;
}
