import { graphqlFetcher } from "@/services/graphql/fetcher";
import { Posts } from "../types/post";

export type LatestPostProps = {
  limit?: number;
  order?: "ASC" | "DESC";
  pagination?: boolean;
  numberPerPages?: number;
  fieldOrder?: string;
};

export async function getLatestPosts({
  order = "DESC",
  limit = 4,
  fieldOrder = "DATE",
}: LatestPostProps) {
  const query = `{
  posts(first: ${limit}, where: { orderby: { field: ${fieldOrder}, order: ${order} } }) {
    nodes {
      content(format: RENDERED)
      link
      slug
      postId
      title
      uri
      date
      authorId
      author {
        node {
          avatar {
            url
          }
          name
        }
      }
      featuredImage {
        node {
          sourceUrl
        }
      }
    }
  }
}`;
  const response = await graphqlFetcher<Posts>(query);

  return response.data?.posts.nodes ?? [];
}

export async function getLatestPostsSlug({ limit = 4 }: LatestPostProps) {
  const query = `{
  posts(first: ${limit}) {
    nodes {
      slug
      modified
      uri
      seo {
        robots
      }
      sitemapValue {
        priority
      }
    }
  }
}`;
  const response = await graphqlFetcher<Posts>(query);

  return response.data?.posts.nodes ?? [];
}
