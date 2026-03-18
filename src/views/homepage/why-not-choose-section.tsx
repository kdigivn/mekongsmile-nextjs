/* eslint-disable @arthurgeron/react-usememo/require-memo */

import { HomeHighLight } from "@/services/infrastructure/wordpress/types/sideBar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from "next/image";

type Props = {
  homeHighLight: HomeHighLight;
};

const WhyNotChooseSection = ({ homeHighLight }: Props) => {
  // const isMobile = useCheckMobile();

  // const mobileWhyChooseRender = () => {
  //   return (
  //     <Carousel className="flex">
  //       <CarouselContent className="flex justify-between md:m-0">
  //         {homeHighLight?.map((item, idx) => (
  //           <CarouselItem className="" key={idx}>
  //             <div className="flex h-full w-full items-center justify-center">
  //               <div className=" flex h-full w-4/5 flex-col items-center gap-4  rounded-lg bg-white p-4">
  //                 <Image
  //                   src={
  //                     item?.imageItem?.node?.sourceUrl ??
  //                     "static-img/homepod.svg"
  //                   }
  //                   alt={item?.imageItem?.node?.altText ?? ""}
  //                 />
  //                 <div className="flex flex-col items-center gap-2">
  //                   <p className="text-base font-semibold">{item?.title}</p>
  //                   <p className=" text-justify text-sm">{item?.description}</p>
  //                 </div>
  //               </div>
  //             </div>
  //           </CarouselItem>
  //         ))}
  //       </CarouselContent>
  //       <CarouselPrevious
  //         iconClassName="text-white h-8 w-8 pr-1 bg-primary-800 rounded-full  bg-primary-main hover:text-white"
  //         className="absolute -left-10 top-1/2 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:hidden"
  //       ></CarouselPrevious>
  //       <CarouselNext
  //         iconClassName="text-white h-8 w-8 pl-1 bg-primary-800 rounded-full  bg-primary-main hover:text-white"
  //         className="absolute -right-10 top-1/2 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:hidden"
  //       ></CarouselNext>
  //     </Carousel>
  //   );
  // };

  const desktopWhyChooseRender = () => {
    return (
      <ScrollArea className="whitespace-nowrap">
        <div className="flex gap-6">
          {homeHighLight?.map((item, idx) => (
            <div
              key={idx}
              className="flex h-full w-[282px] flex-col gap-2 rounded-lg p-4"
            >
              <div className="h-20 w-20">
                <Image
                  src={
                    item?.imageItem?.node?.sourceUrl ?? "static-img/homepod.svg"
                  }
                  alt={item?.imageItem?.node?.altText ?? ""}
                  className="aspect-square h-full w-full rounded-none object-cover"
                  height={80}
                  width={80}
                  unoptimized
                />
              </div>

              <p className="h-12 whitespace-normal text-base font-semibold">
                {item?.title}
              </p>
              <p className="whitespace-normal text-justify text-sm">
                {item?.description}
              </p>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  };
  return <div className="flex gap-5">{desktopWhyChooseRender()}</div>;
};

export default WhyNotChooseSection;
