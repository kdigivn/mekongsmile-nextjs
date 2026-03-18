"use client";

import { Post } from "@/services/infrastructure/wordpress/types/post";
import Image from "next/image";
import React, { memo, useEffect, useState } from "react";
import { MdEditCalendar } from "react-icons/md";
import LinkBase from "@/components/link-base";
import { format } from "date-fns";
import HeadingBase from "@/components/heading/heading-base";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/services/i18n/client";

type Props = {
  posts: Post[];
};
const LatestPostsSection = ({ posts }: Props) => {
  const { t: postTranslation } = useTranslation("post/latest-post");
  const [postsData, setPostsData] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEmptyPost, setIsEmptyPost] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    if (posts !== undefined && posts.length > 0) {
      setPostsData(posts);
      setIsLoading(false);
    }

    if (posts?.length === 0) {
      setIsEmptyPost(true);
    }
  }, [posts]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-white bg-white p-3">
        <HeadingBase>{postTranslation("heading")}</HeadingBase>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-lg !bg-neutral-200" />
          <Skeleton className="h-20 w-full rounded-lg !bg-neutral-200" />
          <Skeleton className="h-20 w-full rounded-lg !bg-neutral-200" />
          <Skeleton className="h-20 w-full rounded-lg !bg-neutral-200" />
        </div>
      </div>
    );
  } else {
    if (isEmptyPost) {
      return (
        <div className="flex flex-col gap-3 rounded-lg border border-white bg-white p-3">
          <HeadingBase>{postTranslation("heading")}</HeadingBase>
          <div className="flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-black">
              {postTranslation("empty-post-message")}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 rounded-lg border border-white bg-white p-3">
        <HeadingBase>{postTranslation("heading")}</HeadingBase>
        <div className="flex flex-col gap-3">
          {postsData?.map((item, idx) => (
            <LinkBase
              key={idx}
              href={`/${item?.slug}`}
              className="group flex h-20 items-start rounded-lg border border-white"
            >
              <div className="h-full w-4/12">
                <Image
                  className="!h-full !w-full rounded-t-lg object-cover md:rounded-none md:rounded-s-lg"
                  src={
                    item?.featuredImage?.node?.sourceUrl
                      ? item?.featuredImage?.node?.sourceUrl
                      : "/static-img/placeholder-image-500x500.png"
                  }
                  alt={
                    item?.featuredImage?.node?.sourceUrl
                      ? item?.featuredImage?.node?.sourceUrl
                      : "Placeholder"
                  }
                  width={90}
                  height={90}
                  unoptimized
                />
              </div>
              <div className="mx-3 flex w-8/12 flex-col gap-1 py-1">
                <h5 className="line-clamp-2 text-ellipsis break-words text-base font-bold text-black transition-all duration-200 group-hover:text-primary-500">
                  {item?.title}
                </h5>
                <div className="flex items-center gap-2 text-sm font-normal text-black transition-all duration-200 group-hover:text-primary-500">
                  <MdEditCalendar size={20} />
                  <div>{format(item?.date, "dd/MM/yyyy")}</div>
                </div>
              </div>
            </LinkBase>
          ))}
        </div>
      </div>
    );
  }
};

export default memo(LatestPostsSection);
