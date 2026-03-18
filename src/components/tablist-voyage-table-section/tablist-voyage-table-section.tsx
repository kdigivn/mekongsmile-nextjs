"use client";

import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  startTransition,
} from "react";
import { PostVoyageTableEnum } from "./enum/tab";
import VoyagesTable from "@/components/table/homepage/voyages-table";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Route } from "@/services/apis/routes/types/route";
import { Operator } from "@/services/apis/operators/types/operator";
import { VoyageItem } from "@/services/apis/voyages/types/voyage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@heroui/react";
import HtmlToImage from "../html-to-image/html-to-image";
import { HtmlToImageSectionCaptureId } from "../html-to-image/enum";
import { DisableRoute } from "@/services/infrastructure/wordpress/types/sideBar";
import { useCheckMobile } from "@/hooks/use-check-screen-type";

class CalendarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-40 w-full items-center justify-center rounded-md border border-neutral-200 text-sm text-neutral-500">
          Không thể tải lịch. Vui lòng tải lại trang.
        </div>
      );
    }
    return this.props.children;
  }
}

const FerryBigCalendar = dynamic(
  () => import("@/components/big-calendar/ferry-big-calendar"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full rounded-md bg-neutral-200" />
        <Skeleton className="h-[700px] w-full rounded-md bg-neutral-200" />
      </div>
    ),
  }
);

export type TablistVoyageTableProps = {
  routeId: number;
  operatorId?: string;
  departureSlug?: string;
  destinationSlug?: string;
  operators: Operator[];
  routes: Route[];
  disableRoutes?: DisableRoute[];
  customizeSelectAction?: (voyage: VoyageItem) => void;
  minDate?: Date;
  hidden?: boolean;
};
const TablistVoyageTableSection = ({
  routeId,
  operatorId,
  departureSlug,
  destinationSlug,
  routes,
  operators,
  customizeSelectAction,
  minDate,
  hidden,
  disableRoutes,
}: TablistVoyageTableProps) => {
  const [activeTab, setActiveTab] = useState<string>(
    PostVoyageTableEnum.DEFAULT
  );

  const isMobile = useCheckMobile();

  const presetRoutesAndOperators = useMemo(() => {
    if (departureSlug) {
      const route = routes?.find(
        (route) => route.departure_abbreviation === departureSlug
      );
      const routeId = route?.departure_id ?? null; // Trả về departure_id hoặc null nếu không tìm thấy
      const operatorIds =
        route?.operators
          ?.map((operator) => operator.operator_id)
          ?.filter(
            (operatorId): operatorId is string => operatorId !== undefined
          ) ?? []; // Loại bỏ undefined

      return {
        route,
        routeId,
        operatorIds,
      };
    } else if (destinationSlug) {
      const route = routes?.find(
        (route) => route.destination_abbreviation === destinationSlug
      );
      const routeId = route?.destination_id ?? null; // Trả về destination_id hoặc null nếu không tìm thấy
      const operatorIds =
        route?.operators
          ?.map((operator) => operator.operator_id)
          ?.filter(
            (operatorId): operatorId is string => operatorId !== undefined
          ) ?? []; // Loại bỏ undefined

      return {
        route,
        routeId,
        operatorIds,
      };
    }

    return { route: null, routeId: null, operatorIds: [] };
  }, [departureSlug, destinationSlug, routes]);

  const handleTabChange = useCallback((value: string) => {
    startTransition(() => setActiveTab(value));
  }, []);

  return (
    <div className={cn("flex w-full flex-col", hidden && "hidden")}>
      <Tabs
        defaultValue={PostVoyageTableEnum.DEFAULT}
        onValueChange={handleTabChange}
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value={PostVoyageTableEnum.DEFAULT}>
              {`Chuyến (ngày)`}
            </TabsTrigger>
            <TabsTrigger value={PostVoyageTableEnum.BIG_CALENDAR}>
              {`Chuyến (tháng)`}
            </TabsTrigger>
          </TabsList>

          {activeTab === PostVoyageTableEnum.DEFAULT ? (
            <HtmlToImage
              captureId={HtmlToImageSectionCaptureId.VOYAGE_SCHEDULES}
              captureButtonName="Lịch tàu"
              sectionCapture={
                isMobile ? "voyages-schedules-mobile" : "voyages-schedules"
              }
            />
          ) : (
            <HtmlToImage
              captureId={
                HtmlToImageSectionCaptureId.BIG_CALENDAR_VOYAGE_SCHEDULES
              }
              captureButtonName="Lịch tàu"
              sectionCapture="voyages-schedules"
            />
          )}
        </div>

        <TabsContent
          value={PostVoyageTableEnum.DEFAULT}
          forceMount
          hidden={PostVoyageTableEnum.DEFAULT !== activeTab}
        >
          <div id={HtmlToImageSectionCaptureId.VOYAGE_SCHEDULES}>
            <VoyagesTable
              operators={operators}
              routes={routes}
              disableRoutes={disableRoutes}
              routeId={presetRoutesAndOperators?.route?.id ?? routeId}
              customizeSelectAction={customizeSelectAction}
              operatorId={operatorId}
              minDate={minDate}
            />
          </div>
        </TabsContent>
        <TabsContent value={PostVoyageTableEnum.BIG_CALENDAR}>
          <div id={HtmlToImageSectionCaptureId.BIG_CALENDAR_VOYAGE_SCHEDULES}>
            <CalendarErrorBoundary>
              <FerryBigCalendar
                routes={routes}
                operators={operators}
                operatorId={operatorId}
                routeId={presetRoutesAndOperators?.route?.id ?? routeId}
              />
            </CalendarErrorBoundary>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default memo(TablistVoyageTableSection);
