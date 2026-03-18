"use client";

import { SchedulesQueryParams } from "@/app/(language)/schedules/_types/route-search-params";
import LinkBase from "@/components/link-base";
import HeadingBase from "@/components/heading/heading-base";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { SortEnum } from "@/services/apis/common/types/sort-type";
import {
  RoutesRequest,
  useGetRoutesQuery,
} from "@/services/apis/routes/routes.service";
import { objectToArray } from "@/services/helpers/objectUtils";
import { Image, Tooltip } from "@heroui/react";
import { formatDate } from "date-fns";
import { memo, useMemo } from "react";
import { TiPhoneOutline } from "react-icons/ti";
import { formatCurrency } from "@/lib/utils";

export type FerryRoute = {
  image: string;
  title: string;
  minPrice: number;
  maxPrice: number;
  destination: string;
  departure: string;
  path: string;
};

const FerrySchedulesSection = () => {
  const requestRoute: RoutesRequest = useMemo(
    () => ({
      sort: [
        {
          orderBy: "destination_name",
          order: SortEnum.ASC,
        },
      ],
    }),
    [] // Update the request object whenever the selectedRouterId changes
  );

  const { routes, routesLoading } = useGetRoutesQuery(requestRoute);
  const filterRouters = routes?.filter(
    (route) => route.destination_abbreviation === "con-dao"
  );

  const ferryRoutes: FerryRoute[] =
    filterRouters?.map((route) => {
      const today = new Date();

      const queryParams: SchedulesQueryParams = {
        from: formatDate(today, "yyyy-MM-dd"),
        p: "1",
      };

      const params = [
        route.id,
        route.departure_abbreviation,
        route.destination_abbreviation,
      ];

      const path = `${params.join("-")}?${objectToArray(queryParams)
        .filter((item) => item.value)
        .map((item) => `${item.key}=${item.value}`)
        .join("&")}`;

      const title = `${route.departure_name} - ${route.destination_name}`;

      return {
        image: "/static-img/placeholder-image-700x394.png",
        title,
        minPrice: 100000,
        maxPrice: 200000,
        destination: route.destination_name,
        departure: route.departure_name,
        path,
      };
    }) || [];

  const renderSection = () => (
    <Carousel className="group relative flex w-3/4 items-center justify-center md:w-full">
      <CarouselContent className="-ml-3">
        {ferryRoutes.map((ferryRoute, idx) => (
          <CarouselItem
            key={idx}
            className="basic-1 pl-3 md:basis-1/2 lg:basis-1/3"
          >
            <FerryRouteCard ferryRoute={ferryRoute} />{" "}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious
        iconClassName="text-white h-8 w-8 pr-1 bg-primary-800 rounded-full  bg-primary hover:text-white"
        className="absolute -left-10 top-1/2 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      ></CarouselPrevious>
      <CarouselNext
        iconClassName="text-white h-8 w-8 pl-1 bg-primary-800 rounded-full  bg-primary hover:text-white"
        className="absolute -right-10 top-1/2 -translate-y-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      ></CarouselNext>
    </Carousel>
  );

  const renderSkeleton = () => (
    <div className="grid grid-cols-12 gap-3">
      {[1, 2, 3].map((_, idx) => (
        <Skeleton
          key={idx}
          className={`${_ !== 1 ? (_ !== 2 ? "hidden md:hidden lg:flex" : "hidden md:flex") : "flex"} col-span-12 h-[296px] flex-col overflow-hidden rounded-lg bg-neutral-200 drop-shadow-md md:col-span-6 lg:col-span-4`}
        >
          <Skeleton className="aspect-[16/9] h-[220px] w-full !rounded-none object-cover" />
        </Skeleton>
      ))}
    </div>
  );

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5">
      <HeadingBase>LỊCH TÀU</HeadingBase>

      {routesLoading && renderSkeleton()}
      {!routesLoading && renderSection()}
    </div>
  );
};

const FerryRouteCard = ({ ferryRoute }: { ferryRoute: FerryRoute }) => {
  return (
    <div className="flex w-full cursor-pointer flex-col overflow-hidden rounded-lg border-1 border-white bg-white duration-200 ease-in-out hover:-translate-y-1">
      <LinkBase href={`/schedules/${ferryRoute.path}`}>
        <Image
          src={
            ferryRoute.image
              ? ferryRoute.image
              : "/static-img/placeholder-image-700x394.png"
          }
          alt={ferryRoute.title}
          height={220}
          loading="lazy"
          className="aspect-[16/9] w-full !rounded-none object-cover"
          // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
        />
      </LinkBase>
      <div className="flex flex-col gap-0 p-3 lg:gap-3">
        <div className="text-xs font-bold text-primary-400">
          {`${formatCurrency(ferryRoute.minPrice)} - ${formatCurrency(ferryRoute.maxPrice)}`}
        </div>
        <div className="flex flex-row items-center justify-between">
          <LinkBase
            className="line-clamp-1 text-ellipsis break-words text-xl font-bold text-black"
            href={`/schedules/${ferryRoute.path}`}
          >
            {ferryRoute.title}
          </LinkBase>
          <Tooltip
            content="Gọi ngay hotline 19009168"
            showArrow
            placement="top"
          >
            <a
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-xl font-bold text-white"
              href="tel:19009168"
            >
              <div className="absolute z-0 h-7 w-7 animate-ping rounded-full bg-primary"></div>
              <TiPhoneOutline className="z-10" />
            </a>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default memo(FerrySchedulesSection);
