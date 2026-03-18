"use client";

import { logoutAction as actionLogout } from "@/server-actions/logout";
import {
  TokenLocalStorageKeys,
  Tokens,
} from "@/services/apis/auth/types/tokens";
import { User } from "@/services/apis/users/types/user";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuthGetMeQuery } from "../apis/auth/auth.service";
import {
  AuthActionsContext,
  AuthContext,
  AuthTokensContext,
} from "./auth-context";

function AuthProvider(props: PropsWithChildren<object>) {
  const [user, setUser] = useState<User | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<Tokens | null>(null);

  const { me, meRefetch } = useAuthGetMeQuery();

  /**
   * Handle set new token. Also save refresh token to localStorage and set auth status to true
   */
  const setTokensInfo = (tokens: Tokens) => {
    // Save refresh token to local storage
    if (tokens?.refreshToken) {
      setToken(tokens);
      localStorage.setItem(
        TokenLocalStorageKeys.refreshToken,
        tokens?.refreshToken
      );
      // Authenticate will always true when set new refresh token
      setIsAuthenticated(true);
    }
  };

  /**
   * Handle logout
   */
  const logOut = useCallback(() => {
    // clear access token on server
    actionLogout();
    // update isAuthenticate status
    setIsAuthenticated(false);
    // clear token
    setToken(null);
    // clear refresh token in localStorage
    localStorage.removeItem(TokenLocalStorageKeys.refreshToken);
    // clear user data
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    meRefetch().then(({ data, isSuccess }) => {
      if (isSuccess && data) {
        setUser(data);
      }
    });
  }, [meRefetch]);

  // When isAuthenticated change to ' ' => get user data
  useEffect(() => {
    if (isAuthenticated && !user) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser, user]);

  useEffect(() => {
    if (me && isAuthenticated) {
      setUser(me);
    }
  }, [isAuthenticated, me, refreshUser, user]);

  // Fetch auth status
  // useEffect(() => {
  // if (localStorage.getItem(TokenLocalStorageKeys.refreshToken)) {
  //   console.log("load refresh token from local");
  //   setToken({
  //     refreshToken: localStorage.getItem(TokenLocalStorageKeys.refreshToken),
  //   });
  // }
  // const checkAuthStatus = async () => {
  //   const isAuthenticated = await checkAuth();
  //   console.log("check status: ", isAuthenticated);
  //   setIsAuthenticated(isAuthenticated);
  // };
  // checkAuthStatus();
  // }, [getUserData, token]);

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
    }),
    [user, isAuthenticated]
  );

  const contextActionsValue = useMemo(
    () => ({
      setUser,
      refreshUser,
      logOut,
      setIsAuthenticated,
    }),
    [logOut, refreshUser]
  );

  const contextTokensValue = {
    token,
    setTokensInfo,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      <AuthActionsContext.Provider value={contextActionsValue}>
        <AuthTokensContext.Provider value={contextTokensValue}>
          {props.children}
        </AuthTokensContext.Provider>
      </AuthActionsContext.Provider>
    </AuthContext.Provider>
  );
}

export default AuthProvider;
