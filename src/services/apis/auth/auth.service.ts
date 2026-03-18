import { useCallback, useMemo } from "react";
import { buildApiPath } from "../build-api-path";
import { RequestConfigType } from "../common/types/request-config";
import useFetch from "../common/use-fetch";
import wrapperFetchJsonResponse from "../common/wrapper-fetch-json-response";
import { Customer } from "../customers/types/customer";
import { FerryTicketApiEndpoints } from "../endpoints";
import { User } from "../users/types/user";
import { Tokens } from "./types/tokens";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import useQueryFetcher from "../common/use-query-fetcher";
import { useQuery } from "@tanstack/react-query";

const authQueryKeys = createQueryKeys(["auth"], {
  getMe: () => ({
    key: [],
  }),
});
export type AuthLoginRequest = {
  email: string;
  password: string;
};

export type AuthLoginResponse = Tokens & {
  user: User;
};

export function useAuthLoginService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthLoginRequest) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.auth.login.email.root
      );
      return fetchBase(requestUrl, {
        method: "POST",
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<AuthLoginResponse>);
    },
    [fetchBase]
  );
}

export type AuthEmailCheckRequest = {
  email: string;
};

export type AuthEmailCheckResponse = {
  isExist: boolean;
  isEmailVerified: boolean;
  provider: string;
};

export function useEmailCheckService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthEmailCheckRequest) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.auth.login.email.checkInOrg
      );
      return fetchBase(requestUrl, {
        method: "POST",
        body: JSON.stringify(data),
      }).then(wrapperFetchJsonResponse<AuthEmailCheckResponse>);
    },
    [fetchBase]
  );
}

export type AuthGoogleLoginRequest = {
  idToken: string;
};

export type AuthGoogleLoginResponse = Tokens & {
  user: User;
};

export type AuthFacebookLoginRequest = {
  accessToken: string;
};

export type AuthFacebookLoginResponse = Tokens & {
  user: User;
};

export function useAuthFacebookLoginService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthFacebookLoginRequest, requestConfig?: RequestConfigType) => {
      return fetchBase(`/api/v1/auth/facebook/login`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthFacebookLoginResponse>);
    },
    [fetchBase]
  );
}

export type AuthSignUpRequest = {
  email: string;
  password: string;
};

export type AuthSignUpResponse = void;

export function useAuthSignUpService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthSignUpRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.auth.register.root
      );
      return fetchBase(requestUrl, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthSignUpResponse>);
    },
    [fetchBase]
  );
}

export type AuthConfirmEmailRequest = {
  hash: string;
};

export type AuthConfirmEmailResponse = void;

export function useAuthConfirmEmailService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthConfirmEmailRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.auth.login.email.confirm
      );
      return fetchBase(requestUrl, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthConfirmEmailResponse>);
    },
    [fetchBase]
  );
}

export type AuthForgotPasswordRequest = {
  email: string;
};

export type AuthForgotPasswordResponse = void;

export function useAuthForgotPasswordService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthForgotPasswordRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.auth.password.forgot
      );
      return fetchBase(requestUrl, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthForgotPasswordResponse>);
    },
    [fetchBase]
  );
}

export type AuthResetPasswordRequest = {
  password: string;
  hash: string;
};

export type AuthResetPasswordResponse = void;

export function useAuthResetPasswordService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthResetPasswordRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.auth.password.reset
      );
      return fetchBase(requestUrl, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthResetPasswordResponse>);
    },
    [fetchBase]
  );
}

export type AuthPatchMeRequest =
  | Partial<Pick<Customer, "first_name" | "last_name">>
  | { password: string; oldPassword: string };

export type AuthPatchMeResponse = User;

export function useAuthPatchMeService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: AuthPatchMeRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.auth.password.change
      );
      return fetchBase(requestUrl, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AuthPatchMeResponse>);
    },
    [fetchBase]
  );
}

export type AuthGetMeResponse = User;

export function useAuthGetMeQuery(requestConfig?: RequestConfigType) {
  const fetch = useQueryFetcher();
  const requestUrl = buildApiPath(FerryTicketApiEndpoints.v1.auth.me);

  const { data, isLoading, isSuccess, error, refetch } = useQuery({
    queryKey: authQueryKeys.getMe().key,
    staleTime: 0, // Auth state must reflect latest login/logout immediately
    enabled: false, // Don't auto-fetch — callers use refetch() after checking auth state
    queryFn: () =>
      fetch<AuthGetMeResponse>(requestUrl, "GET", null, requestConfig),
  });

  const memoizedValue = useMemo(
    () => ({
      me: data,
      meLoading: isLoading,
      meError: error,
      meRefetch: refetch,
      meSuccess: isSuccess,
    }),
    [data, error, isLoading, isSuccess, refetch]
  );

  return memoizedValue;
}

export function useSendEmailOTPService() {
  const fetchBase = useFetch();

  return useCallback(
    (
      email: string,
      firstName: string,
      lastName: string,
      phone: string,
      phone_country_code: string
    ) => {
      const url = buildApiPath(
        FerryTicketApiEndpoints.auth.register.withEmailOTP
      );
      return fetchBase(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
          phone_country_code,
        }),
      }).then(wrapperFetchJsonResponse<void>);
    },
    [fetchBase]
  );
}

export function useVerifyEmailOTPAndResetPasswordService() {
  const fetchBase = useFetch();

  return useCallback(
    async (email: string, otp: string) => {
      const url = buildApiPath(
        FerryTicketApiEndpoints.auth.login.email.verifyEmailOTPAndResetPassword
      );
      return fetchBase(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          OTP: otp,
        }),
      }).then(wrapperFetchJsonResponse<AuthLoginResponse>);
    },
    [fetchBase]
  );
}

export function useResendOTPService() {
  const fetchBase = useFetch();
  return useCallback(
    (email: string) => {
      const url = buildApiPath(
        FerryTicketApiEndpoints.auth.login.email.resendEmailOTP
      );
      return fetchBase(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      }).then(wrapperFetchJsonResponse<void>);
    },
    [fetchBase]
  );
}

export function useResendVerifyEmailService() {
  const fetchBase = useFetch();
  return useCallback(
    (email: string) => {
      const url = buildApiPath(
        FerryTicketApiEndpoints.auth.login.email.useResendVerifyEmail
      );
      return fetchBase(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      }).then(wrapperFetchJsonResponse<void>);
    },
    [fetchBase]
  );
}
