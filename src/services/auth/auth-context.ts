"use client";

import { Tokens } from "@/services/apis/auth/types/tokens";
import { User } from "@/services/apis/users/types/user";
import { createContext } from "react";

export const AuthContext = createContext<{
  user: User | null;
  isAuthenticated: boolean;
}>({
  user: null,
  isAuthenticated: false,
});

export const AuthActionsContext = createContext<{
  setUser: (user: User) => void;
  refreshUser: () => void;
  logOut: () => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}>({
  setUser: () => {},
  refreshUser: () => {},
  logOut: async () => {},
  setIsAuthenticated: () => {},
});

export const AuthTokensContext = createContext<{
  token: Tokens | null;
  setTokensInfo: (token: Tokens) => void;
}>({
  token: {
    token: null,
    refreshToken: null,
    tokenExpires: null,
  },
  setTokensInfo: () => {},
});
