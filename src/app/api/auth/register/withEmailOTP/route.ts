/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { buildApiPath } from "@/services/apis/build-api-path";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import wrapperFetchJsonResponse from "@/services/apis/common/wrapper-fetch-json-response";
import { FerryTicketApiEndpoints } from "@/services/apis/endpoints";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  //convert` /api/v1/bookings...` to `https://server-url/api_prefix/v1/bookings...`
  const requestUrl = buildApiPath(
    FerryTicketApiEndpoints.v1.auth.email.registerWithEmailOTP
  )
    .toString()
    .replace(/\/$/, "");

  console.log(`Forward POST Sign Up with Email OTP: ${requestUrl}`);

  const body = JSON.parse(await request.text());

  const res = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FERRY_DEFAULT_API_KEY}`,
    },
    body: JSON.stringify({
      ...body,
    }),
  }).then(wrapperFetchJsonResponse<object | undefined>);

  return Response.json(res.data ?? null, {
    status: res.status === HTTP_CODES_ENUM.NO_CONTENT ? 200 : res.status,
  });
}
