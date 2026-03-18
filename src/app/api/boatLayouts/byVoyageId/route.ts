/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { BoatLayoutResponse } from "@/services/apis/boatLayouts/boatlayout.service";
import { buildApiPath } from "@/services/apis/build-api-path";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import wrapperFetchJsonResponse from "@/services/apis/common/wrapper-fetch-json-response";
import { FerryTicketApiEndpoints } from "@/services/apis/endpoints";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const header = request.headers;
  header.set("Authorization", `Bearer ${process.env.FERRY_DEFAULT_API_KEY}`);

  const requestUrl = `${buildApiPath(
    FerryTicketApiEndpoints.v1.boatLayouts.byVoyageId
  )}${request.nextUrl.search}`;

  const { data, status } = await fetch(requestUrl, {
    method: "GET",
    headers: header,
  }).then(wrapperFetchJsonResponse<BoatLayoutResponse>);

  // If status is NO_CONTENT, return 200
  // Response can't return 204
  return Response.json(data ?? null, {
    status: status === HTTP_CODES_ENUM.NO_CONTENT ? 200 : status,
  });
}
