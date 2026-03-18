/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { Tokens } from "@/services/apis/auth/types/tokens";
import { buildApiPath } from "@/services/apis/build-api-path";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import wrapperFetchJsonResponse from "@/services/apis/common/wrapper-fetch-json-response";
import { FerryTicketApiEndpoints } from "@/services/apis/endpoints";
import { NextRequest } from "next/server";
import { setJWTCookie } from "../../set-jwt-cookies";

type AuthLoginResponse = Tokens;

export async function POST(request: NextRequest) {
  const requestUrl = buildApiPath(FerryTicketApiEndpoints.v1.auth.refresh);
  const { data, status } = await fetch(requestUrl, {
    method: "POST",
    body: await request.text(),
    headers: request.headers,
  }).then(wrapperFetchJsonResponse<AuthLoginResponse>);

  if (status === HTTP_CODES_ENUM.OK && data?.token && data?.tokenExpires) {
    setJWTCookie(data.token, data.tokenExpires);
  }

  return Response.json(data ?? null, {
    status: status === HTTP_CODES_ENUM.NO_CONTENT ? 200 : status,
  });
}
