"use client";

import useLanguage from "@/services/i18n/use-language";
// eslint-disable-next-line no-restricted-imports
import NextLink, { LinkProps } from "next/link";
import { forwardRef } from "react";

/**
 * An i18n-supported version of NextJS Link component
 */
const LinkBase = forwardRef<
  HTMLAnchorElement,
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
    LinkProps & {
      children?: React.ReactNode;
    } & React.RefAttributes<HTMLAnchorElement>
>(function LinkBase(props, ref) {
  const language = useLanguage();
  let href = props.href;
  if (process.env.INTERNATIONAL_ROUTING_ENABLED === "true") {
    if (typeof href === "string" && href.startsWith("/")) {
      href = `/${language}${href}`;
    } else if (typeof href === "object" && href !== null) {
      const pathname = href.pathname
        ? `/${language}${href.pathname}`
        : href.pathname;
      href = {
        ...href,
        pathname,
      };
    }
  }

  return (
    <NextLink ref={ref} {...props} href={href}>
      {props.children}
    </NextLink>
  );
});

export default LinkBase;
