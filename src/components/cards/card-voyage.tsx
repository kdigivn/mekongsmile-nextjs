"use client";

import { calculateDuration, cn, formatHourString } from "@/lib/utils";
import { VoyageItem } from "@/services/apis/voyages/types/voyage";
import { useTranslation } from "@/services/i18n/client";
import { Card, CardBody, Tooltip } from "@heroui/react";
import { memo, useCallback } from "react";
import {
  MdOutlineAirlineSeatReclineExtra,
  MdOutlinePermIdentity,
} from "react-icons/md";
import { RiArrowRightLine } from "react-icons/ri";
import RouteArrow from "../icons/route-arrow";
import { Button } from "../ui/button";
import ChangedTicketPriceContent from "../changed-ticket-price-content";
import TicketSpeedBadge from "../badge/ticket-speed-badge";
import { IssueTicketSpeedEnum } from "@/services/apis/operators/enums/issue-ticket-speed.enum";
import Image from "next/image";

type Props = {
  voyageItem: VoyageItem;
  isLoaded?: boolean;
  onSelectButtonPress?: () => void;
  onMapButtonPress?: () => void;
  onCheckSeatButtonPress?: () => void;
  className?: string;
  handleOpenDialog: () => void;
};

const CardVoyage = ({
  voyageItem,
  isLoaded = false,
  onSelectButtonPress,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMapButtonPress,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCheckSeatButtonPress,
  className,
  handleOpenDialog,
}: Props) => {
  const { t } = useTranslation("search/search-result-card");
  // const isMobile = useCheckMobile();

  const handleOnCheckSeatButtonPress = useCallback(() => {
    if (onCheckSeatButtonPress) onCheckSeatButtonPress();
  }, [onCheckSeatButtonPress]);

  const handleOnSelectButtonPress = useCallback(() => {
    if (onSelectButtonPress) onSelectButtonPress();
  }, [onSelectButtonPress]);

  return (
    <Card
      id={voyageItem?.voyage?.id}
      className={cn("rounded-md shadow-sm", className)}
      shadow="none"
      radius="none"
    >
      <CardBody className="grid grid-cols-12 items-center gap-x-2 gap-y-3 md:gap-3">
        {/* Col 1 section */}
        <div className="col-span-12 flex flex-row items-center justify-between gap-1 md:col-span-4 md:flex-col md:items-start md:justify-start lg:col-span-4">
          {/* Operator & Boat info */}
          <div className="flex items-center gap-1 md:gap-3">
            {/* Operator logo */}
            <div className="min-w-fit flex-none">
              <Image
                src={voyageItem?.voyage?.operator?.operator_logo?.path ?? ""}
                alt={voyageItem?.voyage?.operator?.operator_name ?? ""}
                className="h-10 w-10 flex-none rounded-md md:h-12 md:w-12"
                width={40}
                height={40}
                unoptimized
              />
            </div>
            {/* Operator name & boat name */}
            <div className="flex flex-col items-start justify-start gap-1 overflow-hidden text-sm md:text-base">
              <div className="flex flex-wrap items-center gap-1 text-sm">
                <TicketSpeedBadge
                  speed={
                    voyageItem?.voyage?.operator?.configs
                      ?.issue_ticket_speed as IssueTicketSpeedEnum
                  }
                />
                {voyageItem?.voyage?.clickBait && (
                  <span className="rounded-md bg-orange-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                    Hot
                  </span>
                )}
                <p>{voyageItem?.voyage?.operator?.operator_name}</p>
              </div>

              <div className="flex flex-nowrap items-center gap-1 md:gap-2">
                <p className="flex text-nowrap text-xs md:text-sm">
                  {voyageItem?.voyage?.boat_name}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex h-6 flex-row items-center gap-1 md:flex-row md:items-center md:gap-2">
            {/* Available seats chip */}
            <div className="flex items-center rounded px-2 py-1">
              <MdOutlinePermIdentity className="h-4 w-4" />
              <p className="text-xs">
                <span className="hidden md:inline">{`${t("availableSeats")}:`}</span>
                {` ${voyageItem?.voyage?.no_remain >= 100 ? "100+" : voyageItem?.voyage?.no_remain > 0 ? "20+" : 0}`}
              </p>
            </div>

            {/* Check map */}
            {/* <Tooltip content={t("tooltip.map")}>
              <Button
                aria-label={t("tooltip.map")}
                className="h-6 w-6 min-w-0 rounded bg-primary-100 p-1 text-foreground hover:bg-primary-100"
                // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                onClick={() => {
                  if (onMapButtonPress) onMapButtonPress();
                }}
              >
                <MdOutlineMap className="h-4 w-4" />
              </Button>
            </Tooltip> */}

            {/* Check seat */}
            <Tooltip content={t("tooltip.seat")}>
              <Button
                aria-label={t("tooltip.seat")}
                className="h-6 w-6 min-w-0 rounded bg-primary-100 p-1 text-foreground hover:bg-primary-100"
                onClick={handleOnCheckSeatButtonPress}
              >
                <MdOutlineAirlineSeatReclineExtra className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Col 2 section */}
        <div className="col-span-12 flex flex-col justify-center gap-4 md:col-span-5 md:items-center">
          {/* Departure & Destination */}
          <div className="flex items-center justify-between gap-0 md:w-full md:gap-3 lg:w-auto lg:justify-between">
            {/* Departure */}
            <div className="flex flex-col items-center justify-center">
              <p className="text-nowrap text-sm font-semibold md:text-base">
                {voyageItem?.voyage?.depart_time
                  ? formatHourString(voyageItem?.voyage?.depart_time)
                  : ""}
              </p>
              <p className="!my-0 flex-none text-xs md:text-sm">
                {voyageItem?.voyage?.route?.departure_name}
              </p>
            </div>
            {/* Icon */}
            <div className="flex flex-col">
              <div className="flex w-full justify-center text-sm text-default-600">
                {calculateDuration(
                  voyageItem?.voyage?.depart_time,
                  voyageItem?.voyage?.arrive_time
                )}
              </div>
              <RouteArrow color="#000000" />
            </div>
            {/* Destination */}
            <div className="flex flex-col items-center justify-center">
              <p className="text-nowrap text-right text-sm font-semibold md:text-base">
                {voyageItem?.voyage?.arrive_time
                  ? formatHourString(voyageItem?.voyage?.arrive_time)
                  : ""}
              </p>
              <p className="!my-0 flex-none text-right text-xs md:text-sm">
                {voyageItem?.voyage?.route?.destination_name}
              </p>
            </div>
          </div>
          {/* Depart time */}
          {/* <div className="flex items-center justify-center gap-1 md:gap-2">
            <CiCalendar className="h-4 w-4 md:h-5 md:w-5" />
            <p className="text-xs font-semibold md:text-sm">
              {`${t("depart")}: ${isMobile ? "\n" : ""} ${format(new Date(`${voyageAddition?.voyage?.departure_date}`), "dd/MM/yyyy")}`}
            </p>
          </div> */}
        </div>

        {/* Col 3 section */}
        <div className="col-span-12 flex justify-end md:col-span-3 md:col-start-10 lg:col-start-10">
          <div className="flex w-full flex-row items-center justify-between gap-1 md:flex-col md:items-end lg:justify-center">
            <div className="text-base font-bold text-primary md:text-xl">
              <ChangedTicketPriceContent
                wrapperClassname="md:items-end items-start"
                voyageItem={voyageItem}
                onClick={handleOpenDialog}
              />
            </div>
            <Button
              disabled={!isLoaded || voyageItem?.voyage?.no_remain === 0}
              variant={
                voyageItem?.voyage?.no_remain === 0 ? "outline" : "default"
              }
              onClick={handleOnSelectButtonPress}
              className="choose-voyage-button flex justify-between gap-1 overflow-hidden rounded-lg px-3 text-sm font-medium md:w-36 md:gap-3 md:text-base"
              id={`mobile-btn-choose-voyage-${voyageItem?.voyage?.id}`}
            >
              {voyageItem?.voyage?.no_remain === 0
                ? t("noRemain")
                : t("selectButton")}
              <RiArrowRightLine className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default memo(CardVoyage);
