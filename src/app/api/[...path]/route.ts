/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { TokenCookieKeys } from "@/services/apis/auth/types/tokens";
import { API_SERVER_URL } from "@/services/apis/common/config";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import wrapperFetchJsonResponse from "@/services/apis/common/wrapper-fetch-json-response";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const jwt: string | undefined = request.cookies.get(
    TokenCookieKeys.Jwt
  )?.value;

  if (jwt) {
    request.headers.set("Authorization", `Bearer ${jwt}`);
  }

  //convert` /api/v1/bookings...` to `https://server-url/api_prefix/v1/bookings...`
  const requestUrl = `${API_SERVER_URL}${request.nextUrl.pathname.replace(/^\/api/, process.env.API_SERVER_PREFIX ?? "").replace(/\/$/, "")}${request.nextUrl.search}`;

  console.log(`Forward GET: ${requestUrl}`);

  const res = await fetch(requestUrl, {
    method: request.method,
    headers: request.headers,
    cache: request.cache,
    credentials: request.credentials,
    integrity: request.integrity,
    mode: request.mode,
    keepalive: request.keepalive,
  }).then(wrapperFetchJsonResponse<object | undefined>);

  return Response.json(res.data ?? null, {
    status: res.status === HTTP_CODES_ENUM.NO_CONTENT ? 200 : res.status,
  });
}

export async function POST(request: NextRequest) {
  // eslint-disable-next-line prettier/prettier

  const jwt: string | undefined = // eslint-disable-next-line prettier/prettier
    request.cookies.get(TokenCookieKeys.Jwt)?.value;

  if (jwt) {
    request.headers.set("Authorization", `Bearer ${jwt}`);
  }

  //convert` /api/v1/bookings...` to `https://server-url/api_prefix/v1/bookings...`
  const requestUrl = `${API_SERVER_URL}${request.nextUrl.pathname.replace(/^\/api/, process.env.API_SERVER_PREFIX ?? "").replace(/\/$/, "")}${request.nextUrl.search}`;

  console.log(`Forward POST: ${requestUrl}`);

  const options = {
    method: "POST",
    headers: request.headers,
    body: request.body,
    cache: request.cache,
    credentials: request.credentials,
    integrity: request.integrity,
    mode: request.mode,
    keepalive: request.keepalive,
    duplex: "half",
  };

  const res = await fetch(requestUrl, options).then(
    wrapperFetchJsonResponse<object | undefined>
  );

  return Response.json(res.data ?? null, {
    status: res.status === HTTP_CODES_ENUM.NO_CONTENT ? 200 : res.status,
  });
}

export async function PUT(request: NextRequest) {
  // eslint-disable-next-line prettier/prettier
  const jwt: string | undefined = // eslint-disable-next-line prettier/prettier
    request.cookies.get(TokenCookieKeys.Jwt)?.value;

  if (jwt) {
    request.headers.set("Authorization", `Bearer ${jwt}`);
  }

  //convert` /api/v1/bookings...` to `https://server-url/api_prefix/v1/bookings...`
  const requestUrl = `${API_SERVER_URL}${request.nextUrl.pathname.replace(/^\/api/, process.env.API_SERVER_PREFIX ?? "").replace(/\/$/, "")}${request.nextUrl.search}`;

  console.log(`Forward PUT: ${requestUrl}`);

  const options = {
    method: "PUT",
    headers: request.headers,
    body: request.body,
    cache: request.cache,
    credentials: request.credentials,
    integrity: request.integrity,
    mode: request.mode,
    keepalive: request.keepalive,
    duplex: "half",
  };

  const res = await fetch(requestUrl, options).then(
    wrapperFetchJsonResponse<object | undefined>
  );

  return Response.json(res.data ?? null, {
    status: res.status === HTTP_CODES_ENUM.NO_CONTENT ? 200 : res.status,
  });
}

export async function DELETE(request: NextRequest) {
  // eslint-disable-next-line prettier/prettier
  const jwt: string | undefined = // eslint-disable-next-line prettier/prettier
    request.cookies.get(TokenCookieKeys.Jwt)?.value;

  if (jwt) {
    request.headers.set("Authorization", `Bearer ${jwt}`);
  }

  //convert` /api/v1/bookings...` to `https://server-url/api_prefix/v1/bookings...`
  const requestUrl = `${API_SERVER_URL}${request.nextUrl.pathname.replace(/^\/api/, process.env.API_SERVER_PREFIX ?? "").replace(/\/$/, "")}${request.nextUrl.search}`;

  console.log(`Forward DELETE: ${requestUrl}`);

  const options = {
    method: "DELETE",
    headers: request.headers,
    body: request.body,
    cache: request.cache,
    credentials: request.credentials,
    integrity: request.integrity,
    mode: request.mode,
    keepalive: request.keepalive,
    duplex: "half",
  };

  const res = await fetch(requestUrl, options).then(
    wrapperFetchJsonResponse<object | undefined>
  );

  return Response.json(res.data ?? null, {
    status: res.status === HTTP_CODES_ENUM.NO_CONTENT ? 200 : res.status,
  });
}
export async function PATCH(request: NextRequest) {
  // eslint-disable-next-line prettier/prettier
  const jwt: string | undefined = // eslint-disable-next-line prettier/prettier
    request.cookies.get(TokenCookieKeys.Jwt)?.value;

  if (jwt) {
    request.headers.set("Authorization", `Bearer ${jwt}`);
  }

  //convert` /api/v1/bookings...` to `https://server-url/api_prefix/v1/bookings...`
  const requestUrl = `${API_SERVER_URL}${request.nextUrl.pathname.replace(/^\/api/, process.env.API_SERVER_PREFIX ?? "").replace(/\/$/, "")}${request.nextUrl.search}`;

  console.log(`Forward PATCH: ${requestUrl}`);

  const options = {
    method: "PATCH",
    headers: request.headers,
    body: request.body,
    cache: request.cache,
    credentials: request.credentials,
    integrity: request.integrity,
    mode: request.mode,
    keepalive: request.keepalive,
    duplex: "half",
  };

  const res = await fetch(requestUrl, options).then(
    wrapperFetchJsonResponse<object | undefined>
  );

  return Response.json(res.data ?? null, {
    status: res.status === HTTP_CODES_ENUM.NO_CONTENT ? 200 : res.status,
  });
}
