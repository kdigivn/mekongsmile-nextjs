"use client";
import { usePathname, useRouter } from "next/navigation";
import useAuth from "./use-auth";
import React, { FunctionComponent, useEffect } from "react";
import useLanguage from "../i18n/use-language";
import { RoleEnum } from "../apis/users/types/role";
type PropsType<T extends object> = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
} & T;
type OptionsType = {
  roles: RoleEnum[];
};
const roles = Object.values(RoleEnum).filter(
  (value) => !Number.isNaN(Number(value))
) as RoleEnum[];
function withPageRequiredAuth<T extends object>(
  Component: FunctionComponent<PropsType<T>>,
  options?: OptionsType
) {
  const optionRoles = options?.roles || roles;
  return function WithPageRequiredAuth(props: PropsType<T>) {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    let language = useLanguage();
    if (process.env.INTERNATIONAL_ROUTING_ENABLED === "false") {
      language = "";
    }
    const pathName = usePathname();
    useEffect(() => {
      const check = () => {
        if (isAuthenticated) {
          return;
        }
        const params = new URLSearchParams({
          returnTo: pathName,
          ...props.searchParams, // thêm các params từ props.searchParams vào URLSearchParams
        });
        let redirectTo = "";
        if (process.env.INTERNATIONAL_ROUTING_ENABLED === "true") {
          redirectTo = `/${language}/sign-in/?${params.toString()}`;
          if (user) {
            redirectTo = `/${language}/`;
          }
        } else {
          redirectTo = `/sign-in/?${params.toString()}`;
          if (user) {
            redirectTo = "/";
          }
        }
        router.replace(redirectTo);
      };
      check();
    }, [user, isAuthenticated, router, language, pathName, props.searchParams]);
    return user && user?.role?.id && optionRoles.includes(user?.role.id) ? (
      <Component {...props} />
    ) : null;
  };
}
export default withPageRequiredAuth;
