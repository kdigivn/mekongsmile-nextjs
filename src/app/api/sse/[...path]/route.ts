/* eslint-disable @arthurgeron/react-usememo/require-memo */
export const dynamic = "force-dynamic";

import { API_SERVER_URL } from "@/services/apis/common/config";
import { NextRequest } from "next/server";
import { EventSourcePolyfill } from "event-source-polyfill";
export async function GET(request: NextRequest) {
  // const jwt: string | undefined = request.cookies.get(
  //   TokenCookieKeys.Jwt
  // )?.value;

  const header = request.headers;

  // if (jwt) {
  //   header.set("Authorization", `Bearer ${jwt}`);
  // } else {
  //   if (defaultToken) {
  //     header.set("Authorization", `Bearer ${defaultToken}`);
  //   } else {
  //     const { token } = await fetchDefaultAccount();
  //     defaultToken = token;

  //     if (defaultToken && defaultToken !== "") {
  //       header.set("Authorization", `Bearer ${defaultToken}`);
  //     }
  //   }
  // }
  header.set("Authorization", `Bearer ${process.env.FERRY_DEFAULT_API_KEY}`);

  //convert` /api/sse/v1/bookings...` to `https://server-url/api_prefix/v1/bookings...`
  const requestUrl = `${API_SERVER_URL}${request.nextUrl.pathname.replace(/^\/api\/sse/, process.env.API_SERVER_PREFIX ?? "")}${request.nextUrl.search}`;

  console.log("Forward request: ", requestUrl);

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const resp = new EventSourcePolyfill(requestUrl, {
    headers: {
      Authorization: header.get("Authorization") ?? "",
    },
  });
  resp.onmessage = async (e) => {
    await writer.write(encoder.encode(`event: message\ndata: ${e.data}\n\n`));
  };

  resp.onerror = async () => {
    resp.close();
    await writer.close();
  };

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
