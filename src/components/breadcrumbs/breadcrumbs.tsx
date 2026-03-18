"use client";

import React, { memo } from "react";
// import { BsDot } from "react-icons/bs";
import LinkBase from "../link-base";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ScrollBar } from "../ui/scroll-area";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";

export type BreadcrumbsLinkProps = {
  name?: string;
  href?: string;
  icon?: React.ReactElement;
};

export type BreadcrumbsProps = {
  links: BreadcrumbsLinkProps[];
  separator?: React.ReactElement;
  lastLinkClassName?: string;
  textClassName?: string;
  hasBackground?: boolean;
  rootClassName?: string;
  hiddenLastLink?: boolean;
};

function Breadcrumbs({
  links,
  separator,
  textClassName = "",
  lastLinkClassName = "",
  hasBackground = true,
  rootClassName = "",
  hiddenLastLink = false,
}: BreadcrumbsProps) {
  const lastLink = links[links.length - 1].name;

  return (
    <div
      className={cn(
        "my-4 flex h-11 w-full flex-row items-center rounded-md p-2",
        hasBackground && "border-1 border-white bg-white shadow-sm",
        rootClassName
      )}
    >
      <ScrollArea className="flex w-full flex-row items-center overflow-auto">
        {links.map((link, idx) => {
          const isLastLink = link.name === lastLink;
          const shouldHideLink = isLastLink && hiddenLastLink;
          const showSeparator = hiddenLastLink
            ? idx < links.length - 2
            : idx < links.length - 1;

          return (
            !shouldHideLink && (
              <React.Fragment key={idx}>
                <LinkBase
                  href={isLastLink ? "#" : link.href || "#"}
                  className={cn(
                    `${isLastLink ? `${lastLinkClassName} text-default-600` : "font-medium text-foreground hover:text-primary"} inline-flex items-center gap-2 whitespace-nowrap text-[0.95rem] text-base font-normal transition-all duration-200 ease-in-out`,
                    textClassName
                  )}
                >
                  {link.icon}
                  {link.name}
                </LinkBase>
                {showSeparator && <Separator separator={separator} />}
              </React.Fragment>
            )
          );
        })}
        <ScrollBar orientation="horizontal" className="h-0.5 bg-default-200" />
      </ScrollArea>
    </div>
  );
}

function Separator({ separator }: { separator?: React.ReactElement }) {
  return (
    <span className="mx-2">
      {separator ? separator : <MdKeyboardDoubleArrowRight />}
    </span>
  );
}

export default memo(Breadcrumbs);
