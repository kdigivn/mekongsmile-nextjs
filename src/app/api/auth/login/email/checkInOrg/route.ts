/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { AuthEmailCheckResponse } from "@/services/apis/auth/auth.service";
import { buildApiPath } from "@/services/apis/build-api-path";
import wrapperFetchJsonResponse from "@/services/apis/common/wrapper-fetch-json-response";
import { FerryTicketApiEndpoints } from "@/services/apis/endpoints";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const header = request.headers;
  header.set("Authorization", `Bearer ${process.env.FERRY_DEFAULT_API_KEY}`);

  const requestUrl = buildApiPath(
    FerryTicketApiEndpoints.v1.auth.email.checkInOrg
  );
  const { data, status } = await fetch(requestUrl, {
    method: "POST",
    body: await request.text(),
    headers: header,
  }).then(wrapperFetchJsonResponse<AuthEmailCheckResponse>);

  return Response.json(data ?? null, { status: status });
}
