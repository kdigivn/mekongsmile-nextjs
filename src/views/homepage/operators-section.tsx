"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { memo, useMemo } from "react";
import LinkBase from "@/components/link-base";
import { Hang } from "@/services/infrastructure/wordpress/types/hang";
import Image from "next/image";
import { AlignmentOptionType } from "embla-carousel/components/Alignment";
type Props = {
  hangs: Hang[];
};
function OperatorsSection({ hangs }: Props) {
  // Nhân đôi mảng nếu số lượng phần tử nhỏ hơn 5
  const repeatedHangs = hangs.length < 5 ? [...hangs, ...hangs] : hangs;

  const opts = useMemo(
    () => ({
      align: "start" as AlignmentOptionType,
      loop: true,
    }),
    []
  );
  return (
    <div className="flex flex-col items-center gap-2">
      <Carousel
        className="group relative flex w-full items-center justify-center"
        opts={opts}
      >
        <CarouselContent className="-ml-2 lg:-ml-5">
          {repeatedHangs.map((item, index) => (
            <CarouselItem
              key={index}
              className="pl-2 md:basis-1/3 lg:basis-1/4 lg:pl-5"
            >
              <LinkBase
                key={item.slug} // Đảm bảo key là duy nhất
                href={`/hang/${item.slug}`}
                aria-label={`Link to ${item.slug}`} // Add aria-label here
                className="flex h-fit w-full cursor-pointer flex-row items-center justify-center overflow-hidden rounded-lg bg-white transition-all duration-200 ease-in-out lg:hover:-translate-y-1"
              >
                <Image
                  src={
                    item.operatorInfo.operator_image?.node.sourceUrl ??
                    "/static-img/placeholder-image-700x394.png"
                  }
                  alt={item.operatorInfo.operator_image?.node.altText ?? "hang"}
                  height={200}
                  width={367}
                  className="aspect-video w-full max-w-64 !rounded-none object-contain px-4"
                  loading="lazy"
                  unoptimized
                />
              </LinkBase>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          iconClassName="text-white h-8 w-8 pr-1 bg-primary-800 rounded-full  bg-primary hover:text-white"
          className="absolute -left-3 top-1/2 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:-left-10"
        ></CarouselPrevious>
        <CarouselNext
          iconClassName="text-white h-8 w-8 pl-1 bg-primary-800 rounded-full  bg-primary hover:text-white"
          className="absolute -right-3 top-1/2 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:-right-10"
        ></CarouselNext>
      </Carousel>
    </div>
  );
}
export default memo(OperatorsSection);
