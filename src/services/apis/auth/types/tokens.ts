export type Tokens = {
  token?: string | null;
  refreshToken: string | null;
  tokenExpires?: number | null;
};

export enum TokenCookieKeys {
  Jwt = "jwt",
}

export enum TokenLocalStorageKeys {
  refreshToken = "refresh-token",
}
