"use client";

import { useAuthGetMeQuery } from "@/services/apis/auth/auth.service";
import { TokenLocalStorageKeys } from "@/services/apis/auth/types/tokens";
import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthStatusFetcher from "@/services/auth/useAuthStatusFetcher";
import { useEffect } from "react";

function AppAuthInitializer() {
  const { isAuthenticated } = useAuth();
  const { setUser } = useAuthActions();
  const { fetchAuthStatus } = useAuthStatusFetcher();
  const { meRefetch } = useAuthGetMeQuery();

  // Initial authentication check
  useEffect(() => {
    // Do not need to check auth on SSR
    if (typeof window === "undefined") return;

    const checkAuthStatus = async () => {
      try {
        if (
          !isAuthenticated &&
          localStorage.getItem(TokenLocalStorageKeys.refreshToken)
        ) {
          const { data, isSuccess } = await meRefetch();
          if (data && isSuccess) {
            setUser(data);
          }
        }
      } catch (error) {
        console.error("Failed to refresh authentication status:", error);
      }
    };

    checkAuthStatus();
  }, [isAuthenticated, meRefetch, setUser]);

  // Fetch and initialize authentication status on mount
  useEffect(() => {
    // Do not need to fetch auth on SSR
    if (typeof window === "undefined") return;

    fetchAuthStatus();
  }, [fetchAuthStatus]);

  return <></>;
}

export default AppAuthInitializer;
