import { graphqlFetcher } from "@/services/graphql/fetcher";
import { CommentFormData } from "@/views/post/comments-section";
import { Comment } from "../types/comment";

type Props = {
  formData: CommentFormData;
};

type CreateCommentResponse = {
  createComment: {
    success: boolean;
    comment: Comment;
  };
};

export async function postComment({ formData }: Props) {
  const mutation = `mutation createComment($input: CreateCommentInput!) {
  createComment(input: $input) {
    success
    comment {
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
}`;
  const response = await graphqlFetcher<CreateCommentResponse>(mutation, {
    input: {
      ...formData,
    },
  });
  if (!response.data?.createComment.success) {
    return response.data?.createComment.comment;
  }
  return null;
}
