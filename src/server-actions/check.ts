"use server";

import { TokenCookieKeys } from "@/services/apis/auth/types/tokens";
import { cookies } from "next/headers";

export async function checkAuth() {
  const jwt: string | undefined = cookies().get(TokenCookieKeys.Jwt)?.value;
  return !!jwt;
}
