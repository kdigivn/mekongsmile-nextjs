"use client";

import { memo, useState } from "react";
import LinkBase from "@/components/link-base";
import Image from "next/image";
import { CiCalendar } from "react-icons/ci";
import HeadingBase from "@/components/heading/heading-base";
import BlogCustomChip from "@/views/blog/blog-custom-chip";
import { format } from "date-fns";
import { removeSquareBracketsInExcerpt } from "@/lib/utils";

type ListWithLoadMoreProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  title: string;
  type: "product" | "post";
};

const ListWithLoadMore = ({ items, title, type }: ListWithLoadMoreProps) => {
  const [visibleItems, setVisibleItems] = useState(6);

  const handleLoadMore = () => {
    setVisibleItems((prev) => prev + 6);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-row items-center justify-start p-3 md:flex-row">
        <HeadingBase headingTag="h2">{title}</HeadingBase>
      </div>

      {/* Items */}
      <div className="grid grid-cols-12 gap-4 rounded-lg">
        {items.slice(0, visibleItems).map((item, index) => (
          <div
            key={index}
            className={`col-span-12 grid w-full grid-cols-12 gap-3 rounded-lg border-1 border-white bg-background p-4 lg:col-span-6`}
          >
            <LinkBase
              href={item.uri}
              className="group col-span-12 block h-full w-full overflow-hidden rounded-lg sm:col-span-4 lg:col-span-5"
            >
              <Image
                src={
                  item.featuredImage?.node.sourceUrl
                    ? item.featuredImage.node.sourceUrl
                    : "/static-img/placeholder-image-700x394.png"
                }
                alt={item.title}
                width={600}
                height={340}
                layout="responsive"
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 33vw, 20vw"
                className="aspect-video w-full rounded-lg object-cover transition-all duration-200 ease-in-out group-hover:rotate-1 group-hover:scale-105 sm:w-72"
              />
            </LinkBase>

            <div className="col-span-12 flex flex-col justify-between gap-3 sm:col-span-8 lg:col-span-7">
              {type === "product" && item.productCategory?.nodes.length > 0 && (
                <LinkBase
                  href={item.productCategory.nodes[0].uri}
                  className="block"
                >
                  <BlogCustomChip label={item.productCategory.nodes[0].name} />
                </LinkBase>
              )}
              {type === "post" && item.categories?.nodes.length > 0 && (
                <LinkBase href={item.categories.nodes[0].uri} className="block">
                  <BlogCustomChip label={item.categories.nodes[0].name} />
                </LinkBase>
              )}
              <div className="flex w-full">
                <LinkBase
                  href={item.uri}
                  className="!line-clamp-2 block h-12 overflow-hidden text-ellipsis break-words text-base font-bold text-black transition-all duration-200 ease-in-out hover:text-primary"
                >
                  {item.title}
                </LinkBase>
              </div>

              <div
                className="!line-clamp-4 hidden h-10 text-sm font-normal text-black md:block"
                dangerouslySetInnerHTML={{
                  __html: removeSquareBracketsInExcerpt(item.excerpt ?? ""),
                }}
              />
              <div className="flex h-5 flex-row items-center gap-1 text-sm">
                <CiCalendar className="h-5 w-5" />
                <div>{format(new Date(item.date), "dd/MM/yyyy")}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {visibleItems < items.length && (
        <button
          onClick={handleLoadMore}
          className="self-end rounded-lg bg-primary px-4 py-2 text-white"
        >
          Xem thêm
        </button>
      )}
    </div>
  );
};

export default memo(ListWithLoadMore);
