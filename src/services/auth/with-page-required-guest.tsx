"use client";
import { useRouter } from "next/navigation";
import useAuth from "./use-auth";
import React, { FunctionComponent, useEffect } from "react";
import useLanguage from "@/services/i18n/use-language";

type PropsType = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

function withPageRequiredGuest(Component: FunctionComponent<PropsType>) {
  return function PageRequiredGuest(props: PropsType) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const language = useLanguage();

    useEffect(() => {
      const check = () => {
        if (!isAuthenticated) return;

        const params = new URLSearchParams(window.location.search);
        const returnTo = params.get("returnTo") ?? `/${language}`;
        // Kiểm tra nếu chỉ có `returnTo` trong params
        if (params.toString() === `returnTo=${params.get("returnTo")}`) {
          // Không có params nào khác, chỉ sử dụng `returnTo`
          router.replace(returnTo);
        } else {
          // Có các params khác, xóa `returnTo` và thêm các params còn lại
          params.delete("returnTo");
          const newUrl = `${returnTo}${params.toString() ? `?${params.toString()}` : ""}`;
          router.replace(newUrl);
        }
        // // Thêm các params còn lại vào URL
        // const newUrl = params.get("returnTo")
        //   ? `${returnTo}`
        //   : `/${language}?${params.toString() ? `/?${params.toString()}` : ""}`;
        // // const newUrl = `${returnTo}${params.toString() ? `?${params.toString()}` : ""}`;
        // router.replace(newUrl);
      };

      check();
    }, [isAuthenticated, router, language]);

    return !isAuthenticated ? <Component {...props} /> : null;
  };
}

export default withPageRequiredGuest;
