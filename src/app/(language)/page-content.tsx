/* eslint-disable @arthurgeron/react-usememo/require-usememo */
"use client";

import { memo } from "react";
import WhyNotChooseSection from "@/views/homepage/why-not-choose-section";
import {
  DisableRoute,
  HomeHighLight,
} from "@/services/infrastructure/wordpress/types/sideBar";
import { Operator } from "@/services/apis/operators/types/operator";
import { Route } from "@/services/apis/routes/types/route";
import HeadingBase from "@/components/heading/heading-base";
import { useTranslation } from "@/services/i18n/client";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  homeHighLight: HomeHighLight;
  operators: Operator[];
  routes: Route[];
  disableRoutes?: DisableRoute[];

  routeId: number;
};

const TablistVoyageTableSection = dynamic(
  () =>
    import(
      "@/components/tablist-voyage-table-section/tablist-voyage-table-section"
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mb-3 mt-6 flex flex-col gap-2">
        {/* table header */}
        <Skeleton className="h-10 w-full rounded-md bg-neutral-200" />
        {/* table body */}
        <div className="grid w-full grid-cols-6 gap-2">
          {Array.from({ length: 60 }).map((_, index) => (
            <Skeleton key={index} className="h-10 rounded-lg bg-neutral-200" />
          ))}
        </div>
      </div>
    ),
  }
);

const Home = ({
  homeHighLight,
  operators,
  routes,
  routeId,
  disableRoutes,
}: Props) => {
  const { t } = useTranslation("home/schedule-section");

  return (
    <div className="flex flex-col gap-6 pt-7">
      <WhyNotChooseSection homeHighLight={homeHighLight} />

      <div
        className="flex w-full scroll-mt-20 flex-col items-center justify-center"
        id="lich-khoi-hanh"
      >
        <HeadingBase headingTag="h2">{t("title")}</HeadingBase>
      </div>

      <TablistVoyageTableSection
        routes={routes}
        disableRoutes={disableRoutes}
        operators={operators}
        routeId={routeId}
      />
    </div>
  );
};

export default memo(Home);
