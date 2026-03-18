/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { setJWTCookie } from "@/app/api/set-jwt-cookies";
import { Tokens } from "@/services/apis/auth/types/tokens";
import { buildApiPath } from "@/services/apis/build-api-path";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import wrapperFetchJsonResponse from "@/services/apis/common/wrapper-fetch-json-response";
import { FerryTicketApiEndpoints } from "@/services/apis/endpoints";
import { User } from "@/services/apis/users/types/user";
import { NextRequest } from "next/server";

type AuthLoginResponse = Tokens & {
  user: User;
};

export async function POST(request: NextRequest) {
  const requestUrl = buildApiPath(
    FerryTicketApiEndpoints.v1.auth.email.verifyEmailOTPAndResetPassword
  );

  const { data, status } = await fetch(requestUrl, {
    method: "POST",
    body: await request.text(),
    headers: {
      ...request.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FERRY_DEFAULT_API_KEY}`,
    },
  }).then(wrapperFetchJsonResponse<AuthLoginResponse>);

  if (status === HTTP_CODES_ENUM.OK && data?.token && data?.tokenExpires) {
    setJWTCookie(data.token, data.tokenExpires);
  }

  return Response.json(data ?? null, { status: status });
}
