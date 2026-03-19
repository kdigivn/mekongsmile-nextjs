import { fetchGraphQL } from "@/graphql/client";
import { GET_TOUR_CONSTANT } from "@/graphql/queries";
import type { GetTourConstantResponse, TourConstant } from "@/graphql/types";

/** ACF Options Page: Tour Constant (whyChooseUs, etc.) */
export async function getTourConstant(): Promise<TourConstant> {
  const data = await fetchGraphQL<GetTourConstantResponse>(GET_TOUR_CONSTANT);
  return data.tourConstantOptions.tourConstant;
}
