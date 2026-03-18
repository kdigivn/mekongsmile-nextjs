"use server";

import { TokenCookieKeys } from "@/services/apis/auth/types/tokens";
import { cookies } from "next/headers";

/**
 * Delete jwt token store on httpOnly cookie
 */
export async function logoutAction() {
  // eslint-disable-next-line prettier/prettier
  const jwt: string | undefined = // eslint-disable-next-line prettier/prettier
    cookies().get(TokenCookieKeys.Jwt)?.value;

  if (!!jwt) {
    cookies().delete(TokenCookieKeys.Jwt);
  }
}
