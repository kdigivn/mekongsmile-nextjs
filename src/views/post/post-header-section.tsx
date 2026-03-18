"use client";

import LinkBase from "@/components/link-base";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useTranslation } from "@/services/i18n/client";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import { formatDate } from "date-fns";
import React, { memo, useCallback, useEffect, useState } from "react";
import { BsDot } from "react-icons/bs";
import { CiCalendar } from "react-icons/ci";
import RatingSection from "./rating-section";
import RouteDisabledPopup from "@/components/popup/route-disabled-popup";

type Props = {
  post: Post;
};
const PostHeaderSection = ({ post }: Props) => {
  const { t } = useTranslation("post/header-section");
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (post.baivietchuyentau.isDisabled) {
      setTimeout(() => {
        setIsOpen(true);
      }, 5000);
    }
  }, [post.baivietchuyentau.isDisabled]);

  const onClose = useCallback(() => setIsOpen(false), []);
  return (
    <>
      <RouteDisabledPopup isOpen={isOpen} onClose={onClose} />
      <div className="flex w-full flex-col gap-4">
        <h1 className="text-3xl font-bold">{post?.title}</h1>

        <div className="flex w-full items-center justify-between gap-2">
          <ScrollArea className="h-8 flex-1">
            <div className="flex gap-1 whitespace-nowrap">
              {post?.categories?.nodes?.map((item, idx) => (
                <LinkBase
                  key={idx}
                  href={item?.uri}
                  className="flex w-fit items-center justify-center rounded bg-default-300 px-2 py-1 text-sm"
                >
                  {item?.name}
                </LinkBase>
              ))}

              {post?.tags?.nodes?.map((item, idx) => (
                <LinkBase
                  key={idx}
                  href={item?.uri}
                  className="flex w-fit items-center justify-center rounded bg-default-300 px-2 py-1 text-sm"
                >
                  {item?.name}
                </LinkBase>
              ))}

              {post?.hang?.nodes?.map((item, idx) => (
                <LinkBase
                  key={idx}
                  href={item?.uri}
                  className="flex w-fit items-center justify-center rounded bg-default-300 px-2 py-1 text-sm"
                >
                  {`${t("operator")}: ${item?.name}`}
                </LinkBase>
              ))}

              {post?.diemDen?.nodes?.map((item, idx) => (
                <LinkBase
                  key={idx}
                  href={item?.uri}
                  className="flex w-fit items-center justify-center rounded bg-default-300 px-2 py-1 text-sm"
                >
                  {`${t("destination")}: ${item?.name}`}
                </LinkBase>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {/* <div className="flex items-center gap-2">
          <Image
            src={post?.author?.node?.avatar?.url ?? ""}
            width={20}
            height={20}
            alt={post?.author?.node?.name}
            className="rounded-full"
          />
          <div className="text-sm">{post?.author?.node?.name}</div>
        </div> */}
        </div>

        <div className="flex w-full flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <RatingSection post={post} />
            </div>

            {post?.date && (
              <>
                <BsDot />
                <div className="flex items-center gap-1 text-default-600">
                  <CiCalendar />
                  <p className="text-sm font-normal">
                    {post?.date ? formatDate(post.date, "dd.MM.yyyy") : ""}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(PostHeaderSection);
