"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { memo } from "react";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import LinkBase from "@/components/link-base";
import HeadingBase from "@/components/heading/heading-base";
import { useCheckDesktop } from "@/hooks/use-check-screen-type";
import { useTranslation } from "@/services/i18n/client";
import Image from "next/image";

type Props = {
  advertisingPosts: Post[];
};
function CouponsSection({ advertisingPosts }: Props) {
  // Uncomment to test
  // advertisingPosts = Array.from({ length: 10 }, () => [
  //   ...advertisingPosts,
  // ]).flat();
  const { t } = useTranslation("home/coupon-section");
  const isDesktop = useCheckDesktop();

  function chunks(n: number, posts: Post[]) {
    const result = [];
    for (let i = 0; i < posts.length; i += n) {
      result.push(posts.slice(i, Math.min(i + n, posts.length)));
    }
    return result;
  }

  const itemsPerChunk = isDesktop ? 3 : 2;
  const couponChunks = chunks(itemsPerChunk, advertisingPosts);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <HeadingBase headingTag="h2">{t("title")}</HeadingBase>

      <Carousel className="group relative flex w-full items-center justify-center">
        <CarouselContent className="-ml-3">
          {couponChunks.map((chunk, index) => {
            return (
              <CarouselItem key={index} className="pl-3">
                <div className={`grid w-full grid-cols-1 gap-3 lg:grid-cols-3`}>
                  {chunk.map((item, idx) => {
                    return (
                      <LinkBase
                        key={idx}
                        href={`/${item.slug}`}
                        className="flex h-fit w-full cursor-pointer flex-row items-center justify-center overflow-hidden rounded-lg bg-white transition-all duration-200 ease-in-out lg:hover:-translate-y-1"
                      >
                        <Image
                          src={
                            item.featuredImage?.node.sourceUrl ??
                            "/static-img/placeholder-image-700x394.png"
                          }
                          alt={item.featuredImage?.node.altText ?? "coupon"}
                          height={200}
                          width={367}
                          className="aspect-video w-full !rounded-none object-cover"
                          loading="lazy"
                          unoptimized
                        />
                      </LinkBase>
                    );
                  })}
                </div>
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
          className="absolute -right-0 top-1/2 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:-right-10"
        ></CarouselNext>
      </Carousel>
    </div>
  );
}
export default memo(CouponsSection);
