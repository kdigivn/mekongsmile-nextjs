"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Event } from "./type/ferry-big-calendar-type";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatStringTime } from "./utils/big-calendar-helper";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

type Props = {
  event: Event;
};

const FerryBigCalendarEvent = ({ event }: Props) => {
  const [title, setTitle] = useState<string>();
  const [tooltipTitle, setTooltipTitle] = useState<string>();

  /**
   * Memorized variable
   */

  const memorizedTooltipContent = useMemo(
    () => (
      <div className="flex items-center gap-1">
        <Avatar className="h-5 w-5">
          <AvatarImage
            src={event.voyageItem.voyage?.operator?.operator_logo?.path}
          />
          <AvatarFallback>#</AvatarFallback>
        </Avatar>
        <div className="text-sm">{tooltipTitle}</div>
      </div>
    ),
    [event.voyageItem.voyage?.operator?.operator_logo?.path, tooltipTitle]
  );

  /**
   * Handle Logic
   */
  const handleEventTitle = useCallback(() => {
    const departTime: string =
      formatStringTime(event.voyageItem.voyage?.depart_time) ?? "";

    const arriveTime: string =
      formatStringTime(event.voyageItem.voyage?.arrive_time) ?? "";

    const combine: string = `${departTime}→${arriveTime}`;
    setTitle(combine);
  }, [
    event.voyageItem.voyage?.depart_time,
    event.voyageItem.voyage?.arrive_time,
  ]);

  const handleEventTooltipTitle = useCallback(() => {
    const departTime: string =
      formatStringTime(event.voyageItem.voyage?.depart_time) ?? "";
    const arriveTime: string =
      formatStringTime(event.voyageItem.voyage?.arrive_time) ?? "";

    const combine: string = `${departTime} → ${arriveTime}: ${event.voyageItem.voyage?.route?.departure_name} - ${event.voyageItem.voyage?.route?.destination_name}`;
    setTooltipTitle(combine);
  }, [
    event.voyageItem.voyage?.arrive_time,
    event.voyageItem.voyage?.depart_time,
    event.voyageItem.voyage?.route?.departure_name,
    event.voyageItem.voyage?.route?.destination_name,
  ]);

  /**
   * Handle effect
   */
  useEffect(() => {
    handleEventTitle();
    handleEventTooltipTitle();
  }, [handleEventTitle, handleEventTooltipTitle]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1">
          <Avatar className="h-4 w-4">
            <AvatarImage
              src={event.voyageItem.voyage?.operator?.operator_logo?.path}
            />
            <AvatarFallback>#</AvatarFallback>
          </Avatar>
          <div className="text-xs">{title}</div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="mb-1 w-fit rounded-md bg-white p-2 text-black">
        {memorizedTooltipContent}
      </TooltipContent>
    </Tooltip>
  );
};

export default memo(FerryBigCalendarEvent);
