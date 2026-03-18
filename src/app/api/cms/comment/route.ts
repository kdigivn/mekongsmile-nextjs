/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { postComment } from "@/services/infrastructure/wordpress/mutations/postComment";
import { CommentFormData } from "@/views/post/comments-section";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  console.log("Forward POST: Create a new comment");

  const body =
    request.body instanceof FormData
      ? await request.formData()
      : await request.json();

  const comment: CommentFormData = {
    commentOn: body.commentOn as number,
    content: body.content as string,
  };

  if (body.author !== "") {
    comment.author = body.author as string;
  } else {
    comment.author = "Vô danh";
  }

  if (body.authorEmail !== "") {
    comment.authorEmail = body.authorEmail as string;
  }

  if (body.authorUrl !== "") {
    comment.authorUrl = body.authorUrl as string;
  }

  const data = postComment({ formData: comment });

  if (!data) {
    return Response.json(
      { message: "Failed to create a new comment" },
      { status: 500 }
    );
  }

  return Response.json(data, { status: 201 });
}
