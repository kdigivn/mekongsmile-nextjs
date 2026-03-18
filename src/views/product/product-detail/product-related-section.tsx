/* eslint-disable @arthurgeron/react-usememo/require-usememo */
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import PostCards from "@/components/cards/post-cards";
import { Product } from "@/services/infrastructure/wordpress/types/product";
import HeadingBase from "@/components/heading/heading-base";
import { useCheckMobile, useCheckTablet } from "@/hooks/use-check-screen-type";
import React, { memo } from "react";

const MemoizedPostCards = memo(PostCards);

type Props = {
  pagination?: boolean;
  products: Product[];
};

function ProductRelatedSection({ pagination = true, products }: Props) {
  //Uncomment to test
  // products = Array.from({ length: 10 }, () => [...products]).flat();

  function useCheckScreenType(): number {
    const isMobile = useCheckMobile();
    const isTablet = useCheckTablet();

    return isMobile ? 1 : isTablet ? 2 : 4; // 1 for mobile, 2 for tablet, 4 for desktop
  }

  const itemsPerChunk = useCheckScreenType();

  // const carouselItemStyle = `grid grid-cols-${itemsPerChunk} w-full gap-3`;

  const renderSkeleton = () => (
    <div
      className={`grid grid-rows-${itemsPerChunk} gap-6 lg:grid-cols-${itemsPerChunk}`}
    >
      {[...Array(itemsPerChunk)].map((_, idx) => (
        <Skeleton
          key={idx}
          className="flex h-[326px] flex-col overflow-hidden rounded-lg bg-neutral-200 drop-shadow-md lg:flex-row"
        >
          <Skeleton className="aspect-[16/9] h-[220px] w-full rounded-lg object-cover" />
        </Skeleton>
      ))}
    </div>
  );

  return (
    <div className="z-20 flex w-full flex-col items-center gap-6 px-5 py-4 md:px-10 xl:px-0">
      <HeadingBase>Có thể bạn quan tâm</HeadingBase>

      {!products ? (
        renderSkeleton()
      ) : pagination ? (
        <Carousel
          className="relative flex w-full items-center justify-center"
          opts={{
            align: "start",
          }}
        >
          <CarouselContent classNameRoot="w-full">
            {products.map((item) => {
              return (
                <CarouselItem
                  key={item.slug || item.productId}
                  className="basis-1/1 group w-full md:basis-1/3 lg:basis-1/4"
                >
                  <MemoizedPostCards post={item} colSpan={""} />
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <CarouselPrevious
            iconClassName="text-white h-8 w-8 pr-1 bg-primary-800 rounded-full  bg-primary hover:text-white"
            className="absolute -left-10 top-1/2 hidden -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block"
          ></CarouselPrevious>
          <CarouselNext
            iconClassName="text-white h-8 w-8 pl-1 bg-primary-800 rounded-full  bg-primary hover:text-white"
            className="absolute -right-10 top-1/2 hidden -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block"
          ></CarouselNext>
        </Carousel>
      ) : (
        <></>
      )}
    </div>
  );
}

export default ProductRelatedSection;
