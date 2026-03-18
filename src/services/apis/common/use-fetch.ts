"use client";

import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import { useCallback } from "react";
import useLanguage from "../../i18n/use-language";
import { TokenLocalStorageKeys, Tokens } from "../auth/types/tokens";
import { buildApiPath } from "../build-api-path";
import { FerryTicketApiEndpoints } from "../endpoints";
import { FetchInitType, FetchInputType } from "./types/fetch-params";
import HTTP_CODES_ENUM from "./types/http-codes";

function useFetch() {
  const language = useLanguage();
  const { setTokensInfo } = useAuthTokens();
  const { logOut } = useAuthActions();

  return useCallback(
    async (input: FetchInputType, init?: FetchInitType) => {
      let headers: HeadersInit = {
        "x-custom-lang": language,
      };

      if (!(init?.body instanceof FormData)) {
        headers = {
          ...headers,
          "Content-Type": "application/json",
        };
      }

      // if (tokens?.token) {
      //   headers = {
      //     ...headers,
      //     Authorization: `Bearer ${tokens.token}`,
      //   };
      // }

      // if (tokens?.tokenExpires && tokens.tokenExpires <= Date.now()) {
      //   const newTokens = await fetch(AUTH_REFRESH_URL, {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${tokens.refreshToken}`,
      //     },
      //   }).then((res) => res.json());

      //   if (newTokens.token) {
      //     tokens?.setTokensInfo?.({
      //       token: newTokens.token,
      //       refreshToken: newTokens.refreshToken,
      //       tokenExpires: newTokens.tokenExpires,
      //     });

      //     headers = {
      //       ...headers,
      //       Authorization: `Bearer ${newTokens.token}`,
      //     };
      //   } else {
      //     tokens?.setTokensInfo?.(null);

      //     throw new Error("Refresh token expired");
      //   }
      // }

      const res = await fetch(input, {
        ...init,
        headers: {
          ...headers,
          ...init?.headers,
        },
      });

      // if (!res.ok) {
      //   throw new Error("Network response was not ok");
      // }

      const refreshToken = localStorage.getItem(
        TokenLocalStorageKeys.refreshToken
      );

      // Server respond Unauthorized => get new access token
      if (res.status === HTTP_CODES_ENUM.UNAUTHORIZED && refreshToken) {
        const requestUrl = buildApiPath(FerryTicketApiEndpoints.auth.refresh);
        const newTokens: Tokens = await fetch(requestUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        }).then((res) => res.json());

        if (newTokens.refreshToken) {
          setTokensInfo({
            refreshToken: newTokens.refreshToken,
          });

          return fetch(input, {
            ...init,
            headers: {
              ...headers,
              ...init?.headers,
            },
          });
        } else {
          logOut();
          throw new Error("Refresh token expired");
        }
      }

      return res;
    },
    [language, setTokensInfo, logOut]
  );
}

export default useFetch;
