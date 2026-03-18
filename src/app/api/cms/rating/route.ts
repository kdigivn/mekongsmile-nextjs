/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { postRating } from "@/services/infrastructure/wordpress/mutations/postRating";
import { RatingPostData } from "@/services/infrastructure/wordpress/types/kk-start-rating";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  console.log("Forward POST: Create a new rating");

  const body =
    request.body instanceof FormData
      ? await request.formData()
      : await request.json();

  const comment: RatingPostData = {
    post_id: body.post_id as number,
    rating: body.rating as number,
  };

  const data = await postRating({ formData: comment });

  if (!data) {
    return Response.json(
      { message: "Failed to create a new rating" },
      { status: 500 }
    );
  }

  return Response.json(data, { status: 201 });
}
