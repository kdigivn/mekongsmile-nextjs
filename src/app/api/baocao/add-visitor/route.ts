/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { buildApiPath } from "@/services/apis/build-api-path";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import wrapperFetchJsonResponse from "@/services/apis/common/wrapper-fetch-json-response";
import { FerryTicketApiEndpoints } from "@/services/apis/endpoints";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const requestUrl = buildApiPath(
    FerryTicketApiEndpoints.v1.webReports.addVisitor
  );

  // Add default API key to headers
  request.headers.set(
    "Authorization",
    `Bearer ${process.env.FERRY_DEFAULT_API_KEY}`
  );

  console.log(`Forward POST add Visitor: ${requestUrl}`);

  const body = JSON.parse(await request.text());

  const res = await fetch(requestUrl, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify({
      ...body,
    }),
  }).then(wrapperFetchJsonResponse<object | undefined>);

  return Response.json(res.data ?? null, {
    status: res.status === HTTP_CODES_ENUM.NO_CONTENT ? 200 : res.status,
  });
}
