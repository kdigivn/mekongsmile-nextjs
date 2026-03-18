import { TokenCookieKeys } from "@/services/apis/auth/types/tokens";
import { cookies } from "next/headers";

export function setJWTCookie(jwt: string, date: number) {
  cookies().set({
    name: TokenCookieKeys.Jwt,
    value: jwt,
    httpOnly: true,
    secure: true,
    path: "/",
    expires: date,
  });
}
