"use client";

import useLanguage from "@/services/i18n/use-language";
import {
  LeavePageActionsContext,
  LeavePageContext,
} from "@/services/leave-page/leave-page-context";
// Need for leave page logic
// eslint-disable-next-line no-restricted-imports
import NextLink, { LinkProps } from "next/link";
import { forwardRef, useCallback, useContext } from "react";

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
  const { isLeavePage } = useContext(LeavePageContext);
  const { setLeavePage, openModal } = useContext(LeavePageActionsContext);
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

  // if (typeof href === "object" && href !== null) {
  //   const pathname = href.pathname ? `${href.pathname}/` : href.pathname;
  //   href = {
  //     ...href,
  //     pathname,
  //   };
  // }

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      if (isLeavePage) {
        e.preventDefault();
        setLeavePage({
          [props.replace ? "replace" : "push"]: href,
        });
        openModal();
      } else {
        props.onClick?.(e);
      }
    },
    [href, isLeavePage, openModal, props, setLeavePage]
  );

  return (
    <NextLink ref={ref} {...props} href={href} onClick={handleClick}>
      {props.children}
    </NextLink>
  );
});

export default LinkBase;
