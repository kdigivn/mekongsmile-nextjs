import { fetchGraphQL } from "@/graphql/client";
import {
  GET_ALL_PAGES,
  GET_PAGE_BY_SLUG,
  GET_ALL_PAGE_SLUGS,
} from "@/graphql/queries";
import type {
  GetAllPagesResponse,
  GetPageBySlugResponse,
  PageData,
} from "@/graphql/types";

/** All pages */
export async function getAllPages(): Promise<PageData[]> {
  const data = await fetchGraphQL<GetAllPagesResponse>(GET_ALL_PAGES);
  return data.pages.nodes;
}

/** Single page by slug */
export async function getPageBySlug(slug: string): Promise<PageData | null> {
  const data = await fetchGraphQL<GetPageBySlugResponse>(GET_PAGE_BY_SLUG, {
    slug,
  });
  return data.page;
}

/** All page slugs for static generation */
export async function getAllPageSlugs(): Promise<
  { slug: string; uri: string | null }[]
> {
  const data = await fetchGraphQL<{
    pages: { nodes: { slug: string; uri: string | null }[] };
  }>(GET_ALL_PAGE_SLUGS);
  return data.pages.nodes;
}
