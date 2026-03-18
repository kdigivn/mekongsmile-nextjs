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
import { useCheckMobile, useCheckTablet } from "@/hooks/use-check-screen-type";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import PostCards from "@/components/cards/post-cards";
import React from "react";

type Props = {
  pagination?: boolean;
  posts: Post[];
};

function PostsSectionWithCarousel({ pagination = true, posts }: Props) {
  //Uncomment to test
  // posts = Array.from({ length: 10 }, () => [...posts]).flat();
  // posts = posts.slice(0, 2);

  function useCheckScreenType(): number {
    const isMobile = useCheckMobile();
    const isTablet = useCheckTablet();

    return isMobile ? 1 : isTablet ? 2 : 4; // 1 for mobile, 2 for tablet, 4 for desktop
  }

  const itemsPerChunk = useCheckScreenType();

  // const carouselItemStyle = `grid grid-cols-${itemsPerChunk} w-full gap-3`;

  const renderSkeleton = () => (
    <div className={`grid grid-cols-${itemsPerChunk} gap-6`}>
      {[...Array(itemsPerChunk)].map((_, idx) => (
        <Skeleton
          key={idx}
          className="col-span-12 flex h-[326px] flex-col overflow-hidden rounded-lg bg-neutral-200 drop-shadow-md md:col-span-6 lg:col-span-4"
        >
          <Skeleton className="aspect-[16/9] h-[220px] w-full !rounded-none object-cover" />
        </Skeleton>
      ))}
    </div>
  );

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-6">
      {!posts ? (
        renderSkeleton()
      ) : pagination ? (
        <Carousel
          className="flex w-full items-center justify-center"
          opts={{
            align: "start",
          }}
        >
          <CarouselContent classNameRoot="w-full">
            {posts.map((item, idx) => {
              return (
                <CarouselItem
                  key={idx}
                  className="w-full md:basis-1/3 lg:basis-1/4"
                >
                  <PostCards post={item} />
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <CarouselPrevious
            iconClassName="text-white h-8 w-8 pr-1 bg-primary-800 rounded-full  bg-primary hover:text-white"
            className="absolute -left-0 top-1/2 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:-left-10"
          ></CarouselPrevious>
          <CarouselNext
            iconClassName="text-white h-8 w-8 pl-1 bg-primary-800 rounded-full  bg-primary hover:text-white"
            className="absolute right-0 top-1/2 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:-right-10"
          ></CarouselNext>
        </Carousel>
      ) : (
        <></>
      )}
    </div>
  );
}

export default PostsSectionWithCarousel;
