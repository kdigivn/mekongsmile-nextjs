import { graphqlFetcher } from "@/services/graphql/fetcher";
import { RatingPostData, RatingResponse } from "../types/kk-start-rating";

type Props = {
  formData: RatingPostData;
};

export async function postRating({ formData }: Props) {
  const mutation = `mutation MyMutation {
  updateKKStarRating(input: {post_id: ${formData.post_id}, rating: ${formData.rating}}) {
    avg
    count
  }
}`;
  const response = await graphqlFetcher<RatingResponse>(mutation);
  console.log(response.data);

  if (response.data?.updateKKStarRating) {
    return response.data?.updateKKStarRating;
  }
  return null;
}
