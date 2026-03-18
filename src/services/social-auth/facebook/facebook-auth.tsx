"use client";

import { useAuthFacebookLoginService } from "@/services/apis/auth/auth.service";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import { useState, useCallback, memo } from "react";
import FullPageLoader from "@/components/full-page-loader";
import useFacebookAuth from "./use-facebook-auth";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";

function FacebookAuth() {
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const authFacebookLoginService = useAuthFacebookLoginService();
  const facebook = useFacebookAuth();
  const { t } = useTranslation("common");
  const [isLoading, setIsLoading] = useState(false);

  const onLogin = useCallback(async () => {
    try {
      const loginResponse = await facebook.login();
      if (!loginResponse.authResponse) return;

      setIsLoading(true);

      const { status, data } = await authFacebookLoginService({
        accessToken: loginResponse.authResponse.accessToken,
      });

      if (status === HTTP_CODES_ENUM.OK) {
        setTokensInfo({
          token: data.token,
          refreshToken: data.refreshToken,
          tokenExpires: data.tokenExpires,
        });
        setUser(data.user);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    setIsLoading,
    authFacebookLoginService,
    setTokensInfo,
    setUser,
    facebook,
  ]);

  return (
    <>
      <Button onClick={onLogin} variant="outline" className="w-full">
        {t("common:auth.facebook.action")}
      </Button>
      <FullPageLoader isLoading={isLoading} />
    </>
  );
}

export default memo(FacebookAuth);
