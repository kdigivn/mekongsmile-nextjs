import { graphqlFetcher } from "@/services/graphql/fetcher";
import {
  FeaturedPosts,
  NotifiedPostPostsResponse,
  Post,
  Posts,
} from "../types/post";

export async function getPosts(
  order: string = "DESC",
  limit: number = 12,
  authorName: string = "",
  categoryName: string = ""
) {
  const query = `query getPosts {
  posts(where: {categoryName: "${categoryName}", authorName: "${authorName}", orderby: {field: MODIFIED, order: ${order}}}, first: ${limit}) {
    nodes {
      excerpt(format: RENDERED)
      link
      slug
      postId
      title
      uri
      date
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      tags {
        nodes {
          name
          link
          tagId
          uri
        }
      }
      categories {
        nodes {
          categoryId
          name
          slug
          uri
        }
      }
    }
  }
}
`;

  const response = await graphqlFetcher<Posts>(query);

  return response.data?.posts.nodes ?? [];
}

/**
 * getAdvertisingPosts - Get advertising posts from wordpress - category id 7
 * @param order ASC or DESC
 * @param limit fetch limit
 * @returns Posts[]
 */
export async function getAdvertisingPosts(
  order: string = "DESC",
  limit: number = 4
) {
  const query = `query getAdvertisingPosts {
  posts(where: {categoryId: 7, orderby: {field: MODIFIED, order: ${order}}}, first: ${limit}) {
    nodes {
      link
      slug
      postId
      title
      uri
      date
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }       
}`;
  const response = await graphqlFetcher<Posts>(query);

  return response.data?.posts.nodes ?? [];
}

type TotalPostResponse = {
  posts: {
    pageInfo: {
      offsetPagination: {
        total: number;
      };
    };
  };
};

export async function getTotalPosts() {
  const query = `query getTotalPosts {
  posts {
    pageInfo {
      offsetPagination {
        total
      }
    }
  }
}`;

  const response = await graphqlFetcher<TotalPostResponse>(query);

  return response.data?.posts.pageInfo.offsetPagination.total ?? 0;
}

export async function getHighLightPosts() {
  const query = `query getPosts {
  blockCustom {
    blockAllFields {
      featuredPosts {
        featured_post {
          nodes {
            link
            slug
            uri
            date
            ... on Post {
              id
              title
              excerpt
              title
              featuredImage {
                node {
                  altText
                  sourceUrl
                }
              }
              categories {
                nodes {
                  categoryId
                  name
                  slug
                  uri
                }
              }
              postId
            }
            ... on Product {
              id
              title
              excerpt
              title
              featuredImage {
                node {
                  sourceUrl
                  altText
                }
              }
              productCategory {
                nodes {
                  productCategoryId
                  name
                  slug
                  uri
                }
              }
              productId
            }
          }
        }
      }
    }
  }
}
`;

  const response = await graphqlFetcher<FeaturedPosts>(query);

  return (
    response.data?.blockCustom.blockAllFields.featuredPosts
      .map((features) =>
        features.featured_post ? features.featured_post.nodes[0] : null
      )
      .filter((item): item is Post => !!item) ?? []
  );
}

export async function getNotifiedPosts() {
  const query = `query getNotifiedPosts {
  posts(where: {categoryName: "thong-bao", orderby: {field: MODIFIED, order: DESC}}) {
    nodes {
        id
        title
        featuredImage {
          node {
            title
            sourceUrl(size: LARGE)
            altText
          }
        }
        modified
        slug
      }
  }
}`;

  const response = await graphqlFetcher<NotifiedPostPostsResponse>(
    query,
    undefined,
    { cacheRevalidateTime: 1 }
  );

  return response.data?.posts.nodes ?? [];
}
