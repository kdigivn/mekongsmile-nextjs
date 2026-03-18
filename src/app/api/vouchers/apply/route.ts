/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { buildApiPath } from "@/services/apis/build-api-path";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import wrapperFetchJsonResponse from "@/services/apis/common/wrapper-fetch-json-response";
import { FerryTicketApiEndpoints } from "@/services/apis/endpoints";
import { ApplyVoucherResponse } from "@/services/apis/voucher/voucher.service";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const header = request.headers;
  header.set("Authorization", `Bearer ${process.env.FERRY_DEFAULT_API_KEY}`);

  const requestUrl = buildApiPath(FerryTicketApiEndpoints.v1.vouchers.apply);

  const { data, status } = await fetch(requestUrl, {
    method: "POST",
    headers: header,
    body: await request.text(),
  }).then(wrapperFetchJsonResponse<ApplyVoucherResponse>);

  // If status is NO_CONTENT, return 200
  // Response can't return 204
  return Response.json(data ?? null, {
    status: status === HTTP_CODES_ENUM.NO_CONTENT ? 200 : status,
  });
}
