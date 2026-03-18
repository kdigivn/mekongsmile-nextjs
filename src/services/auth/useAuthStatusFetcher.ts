import { checkAuth } from "@/server-actions/check";
import { useCallback } from "react";
import useAuthActions from "./use-auth-actions";

export type IResponse = {
  isAuthenticated: boolean;
};

export default function useAuthStatusFetcher() {
  const { setIsAuthenticated } = useAuthActions();

  const fetchAuthStatus = useCallback(async () => {
    const isAuthenticated = await checkAuth();
    setIsAuthenticated(isAuthenticated);
  }, [setIsAuthenticated]);

  return { fetchAuthStatus };
}
