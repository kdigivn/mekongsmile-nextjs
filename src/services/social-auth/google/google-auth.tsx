"use client";

// import FullPageLoader from "@/components/full-page-loader";
import GoogleIcon from "@/components/icons/icon-google";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/services/i18n/client";
import { useGoogleLogin } from "@react-oauth/google";
import { memo, useCallback, useMemo } from "react";

function GoogleAuth() {
  // const { setTokensInfo } = useAuthTokens();
  // const authGoogleLoginService = useAuthGoogleLoginService();
  // const { fetchAuthStatus } = useAuthStatusFetcher();
  // const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation("common");

  // const onSuccess = useCallback(
  //   async (tokenResponse: CodeResponse) => {
  //     setIsLoading(true);

  //     const { status, data } = await authGoogleLoginService({
  //       idToken: tokenResponse.code,
  //     });

  //     if (status === HTTP_CODES_ENUM.OK) {
  //       setTokensInfo({
  //         refreshToken: data.refreshToken,
  //         // token: data.token,
  //         // tokenExpires: data.tokenExpires,
  //       });
  //       // setUser(data.user);
  //       fetchAuthStatus();
  //     }
  //     setIsLoading(false);
  //   },
  //   [setIsLoading, setTokensInfo, fetchAuthStatus]
  // );

  const onSuccess = useCallback(() => {
    // TODO: Implement Google login
  }, []);

  const login = useGoogleLogin(
    useMemo(
      () => ({
        onSuccess,
        flow: "auth-code",
      }),
      [onSuccess]
    )
  );

  return (
    <>
      <Button
        onClick={login}
        variant="ghost"
        type="button"
        className="flex w-full gap-2"
      >
        <GoogleIcon />
        {t("common:auth:google:action")}
      </Button>
      {/* <FullPageLoader isLoading={isLoading} /> */}
    </>
  );
}

export default memo(GoogleAuth);
