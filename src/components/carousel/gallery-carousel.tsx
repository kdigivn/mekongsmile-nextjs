import React, { memo, useEffect, useState } from "react";
import { ProductSlideImage } from "@/services/infrastructure/wordpress/types/product";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import Image from "next/image";

type Props = {
  slides?: ProductSlideImage[];
  startIndex: number;
};

const GalleryCarousel = ({ slides, startIndex }: Props) => {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState<number>(startIndex);

  useEffect(() => {
    if (!api) {
      return;
    }
    // Initialize first scroll index
    api.scrollTo(startIndex);

    api.on("select", () => {
      const handleSelect = () => {
        setSelectedIndex(api.selectedScrollSnap());
      };

      api.on("select", handleSelect);
      handleSelect(); // Initialize the selected index
    });
  }, [api, startIndex]);

  const handleDotClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Carousel setApi={setApi}>
        <CarouselContent>
          {slides?.map((item, idx) => (
            <CarouselItem
              key={idx}
              className="relative h-[40vh] w-full md:h-[50vh] 2xl:h-[65vh]"
            >
              <Image
                src={item?.sourceUrl ?? ""}
                alt={item.altText ?? ""}
                fill
                className="object-cover"
                unoptimized
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          iconClassName="text-white hover:!text-white h-8 w-8 group-hover:opacity-90"
          className="group -left-12 h-12 w-12 border border-white bg-primary-600 hover:!bg-primary-600 hover:!opacity-90"
        />
        <CarouselNext
          iconClassName="text-white hover:!text-white h-8 w-8 group-hover:opacity-90"
          className="group h-12 w-12 border border-white bg-primary-600 hover:!bg-primary-600 hover:!opacity-90"
        />
      </Carousel>

      {/* Image indicators */}
      <Carousel>
        <CarouselContent className="-ml-0">
          {// eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
          slides?.map((item, idx) => (
            <Image
              key={idx}
              src={item?.sourceUrl ?? ""}
              alt={item.altText ?? ""}
              width={100}
              height={100}
              onClick={() => handleDotClick(idx)}
              unoptimized
              className={`${selectedIndex === idx ? "border-primary" : "border-transparent"} h-[100px] rounded-lg border-4 hover:cursor-pointer`}
            />
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
export default memo(GalleryCarousel);
