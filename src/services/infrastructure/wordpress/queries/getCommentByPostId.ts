import { graphqlFetcher } from "@/services/graphql/fetcher";
import { PostResponse } from "../types/post";

export type Props = {
  postId: number;
};

export async function getCommentByPostId({ postId }: Props) {
  const query = `query getCommentByPostId {
                post(id: ${postId}, idType: DATABASE_ID) {
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
  const response = await graphqlFetcher<PostResponse>(query, undefined, {
    cacheRevalidateTime: 0,
  });

  return response.data?.post?.comments?.nodes ?? [];
}
