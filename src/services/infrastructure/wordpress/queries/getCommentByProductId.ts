import { graphqlFetcher } from "@/services/graphql/fetcher";
import { ProductResponse } from "../types/product";

export type Props = {
  productId: number;
};

export async function getCommentByProductId({ productId }: Props) {
  const query = `query getCommentByProductId {
                product(id: ${productId}, idType: DATABASE_ID) {
                  commentCount
                  comments {
                    nodes {
                      author {
                        node {
                          email
                          avatar {
                            url
                            height
                            width
                          }
                          name
                          url
                          email
                        }
                      }
                      content
                      date
                    }
                  }
                }
              }`;
  const response = await graphqlFetcher<ProductResponse>(query, undefined, {
    cacheRevalidateTime: 0,
  });

  return response.data?.product?.comments?.nodes ?? [];
}
