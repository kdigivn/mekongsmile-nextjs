/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";

export const isBrowser = (): boolean => {
  return Boolean(
    typeof window !== "undefined" &&
      window.document &&
      window.document.createElement
  );
};

export function getMobileOS(): "ios" | "android" | "other" {
  const userAgent = navigator.userAgent;

  if (/android/i.test(userAgent)) {
    return "android";
  }

  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return "ios";
  }

  return "other";
}

export const isMac = (): boolean => {
  if (!isBrowser()) return false;
  return navigator.userAgent.includes("Mac");
};

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

export const isJwtExpired = (token: string): boolean => {
  try {
    const decoded: JwtPayload = jwtDecode<JwtPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Invalid token:", error);
    return true;
  }
};
