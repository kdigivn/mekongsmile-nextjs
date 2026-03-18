import { graphqlFetcher } from "@/services/graphql/fetcher";
import { HangsResponse } from "../types/hang";

export async function getHangs() {
  const query = `query getHangs {
  allHang(first: 100) {
    nodes {
      description
      name
      taxonomyName
      uri
      slug
      operatorInfo {
        operatorId
        operator_image {
          node {
            id
            altText
            caption
            date
            description
            link
            sourceUrl
            title
          }
        }
        operatorNote
        routeId
      }
    }
  }
}`;

  const response = await graphqlFetcher<HangsResponse>(query);

  return response.data?.allHang.nodes ?? [];
}

export async function getPostsOfAllOperators(
  order: string = "DESC",
  limit: number = 12
) {
  const query = `
  query queryPostsByHang {
    allHang(first: 100) {
      nodes {
        posts(where: {orderby: {field: MODIFIED, order: ${order}}}, first: ${limit}) {
          nodes {
            title
            content
            uri
            slug
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
    }
  }
  `;

  const response = await graphqlFetcher<HangsResponse>(query);

  return response.data?.allHang?.nodes ?? [];
}
