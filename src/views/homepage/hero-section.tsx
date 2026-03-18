"use client";

import SearchTicketForm from "@/components/form/search-ticket-form";
import HeadingBase from "@/components/heading/heading-base";
import LinkBase from "@/components/link-base";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import LayoutWrapper from "@/components/wrapper/layout-wrapper";
import { cn } from "@/lib/utils";
import { Route } from "@/services/apis/routes/types/route";
import { useTranslation } from "@/services/i18n/client";
import {
  HighlightRouteMain,
  HomeSlider,
} from "@/services/infrastructure/wordpress/types/sideBar";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { memo, useMemo } from "react";

// Tiny SVG blur placeholder — prevents blank flash while hero images load from CDN
const HERO_BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI5Ij48cmVjdCBmaWxsPSIjMWEzNjVkIiB3aWR0aD0iMTYiIGhlaWdodD0iOSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { RiShieldCheckLine } from "react-icons/ri";
import { RxDividerVertical } from "react-icons/rx";
type Props = {
  routes: Route[];
  heroTitle: string;
  heroSlider: HomeSlider;
  highlightRouteMain?: HighlightRouteMain[];
  routeDefault?: Route;
};

const HomeHeroSection = ({
  routes,
  heroTitle,
  heroSlider,
  highlightRouteMain,
  routeDefault,
}: Props) => {
  const { t } = useTranslation("home/hero-section");
  const plugins = useMemo(
    () => [
      Autoplay({
        delay: 5000,
        stopOnInteraction: true,
      }),
    ],
    []
  );

  // const title = useMemo(() => {
  //   if (process.env.NEXT_PUBLIC_BASE_URL?.includes("condao")) {
  //     return t("title");
  //   }
  //   return "Vé tàu cao tốc online";
  // }, [t]);

  const notice1 = useMemo(() => {
    if (process.env.NEXT_PUBLIC_BASE_URL?.includes("condao")) {
      return t("notice1");
    }
    return "Mua vé nhanh, xuất vé điện tử";
  }, [t]);

  const notice2 = useMemo(() => {
    if (process.env.NEXT_PUBLIC_BASE_URL?.includes("condao")) {
      return t("notice2");
    }
    return "Đại lý chính thức";
  }, [t]);

  return (
    <>
      <LayoutWrapper className="pb-4 md:px-0 md:pb-1 lg:px-10 lg:pb-0">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
          <div className="order-last flex w-full flex-col justify-center gap-2 lg:order-first lg:w-4/12">
            <HeadingBase
              headingTag="h1"
              contentClass="text-3xl text-primary-700"
            >
              {heroTitle}
            </HeadingBase>
            <div
              className={cn(
                "flex gap-1",
                !process.env.NEXT_PUBLIC_BASE_URL?.includes("condao") &&
                  "flex-row-reverse justify-end"
              )}
            >
              <div className="flex items-center gap-1">
                <AiOutlineThunderbolt className="text-primary" size={16} />
                <p className="text-xs font-bold">{notice1}</p>
              </div>

              <RxDividerVertical className="text-default" size={16} />

              <div className="flex items-center gap-1">
                <RiShieldCheckLine className="text-primary" size={16} />
                <p className="text-xs font-bold">{notice2}</p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 p-3 px-0 md:pb-0 lg:pb-3">
              <SearchTicketForm
                initRoutes={routes.length ? routes : undefined}
                layout="homeLayout"
                routeDefault={routeDefault}
                highlightRouteMain={highlightRouteMain}
              />
            </div>
          </div>

          <div className="order-last flex w-full md:order-first lg:order-last lg:w-8/12">
            <Carousel plugins={plugins}>
              <CarouselContent>
                {heroSlider?.map((item, idx) => (
                  <CarouselItem key={idx} className="w-full">
                    <LinkBase
                      href={item?.postUrl ?? "#"}
                      target="_blank"
                      aria-label={`Link to ${item?.imageItem.node.altText ?? "the post"}`}
                    >
                      {/* <div className="relative h-[250px] w-full sm:h-[400px]"> */}
                      {idx === 0 ? (
                        <Image
                          sizes="(max-width: 1023px) 100vw, 757px"
                          className="aspect-video h-full w-full rounded-lg object-cover object-center"
                          src={
                            item?.imageItem.node.sourceUrl ??
                            "/static-img/placeholder-image-500x500.png"
                          }
                          alt={item?.imageItem.node.altText ?? ""}
                          width={757}
                          height={400}
                          priority
                          unoptimized
                          placeholder="blur"
                          blurDataURL={HERO_BLUR_PLACEHOLDER}
                        />
                      ) : (
                        <Image
                          sizes="(max-width: 1023px) 100vw, 757px"
                          className="aspect-video h-full w-full rounded-lg object-cover object-center"
                          src={
                            item?.imageItem.node.sourceUrl ??
                            "/static-img/placeholder-image-500x500.png"
                          }
                          alt={item?.imageItem.node.altText ?? ""}
                          width={757}
                          height={400}
                          unoptimized
                          placeholder="blur"
                          blurDataURL={HERO_BLUR_PLACEHOLDER}
                        />
                      )}
                      {/* </div> */}
                    </LinkBase>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious
                iconClassName="text-white hover:!text-white h-7 w-7 group-hover:opacity-90"
                className="group left-1 h-10 w-10 border border-white bg-primary-600 hover:!bg-primary-600 hover:!opacity-90 lg:-left-8"
              />
              <CarouselNext
                iconClassName="text-white hover:!text-white h-7 w-7 group-hover:opacity-90"
                className="group right-1 h-10 w-10 border border-white bg-primary-600 hover:!bg-primary-600 hover:!opacity-90 lg:-right-8"
              />
            </Carousel>
          </div>
        </div>
      </LayoutWrapper>
    </>
  );
};

export default memo(HomeHeroSection);
