import { fetchGraphQL } from "@/graphql/client";
import {
  GET_ALL_BLOG_POSTS,
  GET_ALL_POST_SLUGS,
  GET_ALL_POST_CATEGORIES,
  GET_POST_BY_SLUG,
  GET_ALL_NEWS,
  GET_NEWS_BY_SUBCATEGORY,
  GET_NEWS_BY_SLUG,
} from "@/graphql/queries";
import type {
  GetAllBlogPostsResponse,
  GetPostBySlugResponse,
  PostDetail,
  Category,
} from "@/graphql/types";

/** Paginated blog posts, optional category filter */
export async function getAllBlogPosts(
  first = 12,
  after?: string,
  categoryName?: string
) {
  const data = await fetchGraphQL<GetAllBlogPostsResponse>(GET_ALL_BLOG_POSTS, {
    first,
    after,
    categoryName,
  });
  return data.posts;
}

/** All post slugs for static generation */
export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  const data = await fetchGraphQL<{
    posts: { nodes: { slug: string }[] };
  }>(GET_ALL_POST_SLUGS);
  return data.posts.nodes;
}

/** All post categories */
export async function getAllPostCategories(): Promise<Category[]> {
  const data = await fetchGraphQL<{
    categories: { nodes: Category[] };
  }>(GET_ALL_POST_CATEGORIES);
  return data.categories.nodes;
}

/** Single post by slug */
export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const data = await fetchGraphQL<GetPostBySlugResponse>(GET_POST_BY_SLUG, {
    slug,
  });
  return data.post;
}

/** All news posts (news category + children) */
export async function getAllNews(first = 12, after?: string) {
  const data = await fetchGraphQL<GetAllBlogPostsResponse>(GET_ALL_NEWS, {
    first,
    after,
  });
  return data.posts;
}

/** News filtered by subcategory (Awards, CSR, Events, Organization) */
export async function getNewsBySubcategory(
  subcategory: string,
  first = 12,
  after?: string
) {
  const data = await fetchGraphQL<GetAllBlogPostsResponse>(
    GET_NEWS_BY_SUBCATEGORY,
    { subcategory, first, after }
  );
  return data.posts;
}

/** Single news post by slug (alias of getPostBySlug) */
export async function getNewsBySlug(slug: string): Promise<PostDetail | null> {
  const data = await fetchGraphQL<GetPostBySlugResponse>(GET_NEWS_BY_SLUG, {
    slug,
  });
  return data.post;
}
