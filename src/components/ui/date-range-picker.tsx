"use client";

import { useCheckMobile } from "@/hooks/use-check-screen-type";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/services/i18n/client";
import useLanguage from "@/services/i18n/use-language";
import { addDays, format } from "date-fns";
import { memo, useMemo, useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { IoCalendarClearOutline, IoClose } from "react-icons/io5";
import { Button, buttonVariants } from "./button";
import Calendar from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { getLocaleByKey } from "../../services/helpers/get-locale-by-key";

type DatePickerType = {
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange) => void;
  className?: string;
  disabledDepartureDates?: Date[];
  disabledReturnDates?: Date[];
  setCurrentMonth?: (month: Date) => void;
  setCurrentMonthReturn?: (month: Date) => void;
  setOpenStartDate?: (open: boolean) => void;
  setOpenEndDate?: (open: boolean) => void;
};

function DatePickerWithRange(props: DatePickerType) {
  const { t } = useTranslation("search-ticket-form");
  const language = useLanguage();
  const locale = getLocaleByKey(language);
  const {
    defaultValue,
    onValueChange = () => {},
    className,
    setCurrentMonth,
    disabledDepartureDates,
    disabledReturnDates,
    setCurrentMonthReturn,
    setOpenStartDate,
    setOpenEndDate,
  } = props;

  // Function to find nearest non-disabled date in the same month
  const findNearestValidDate = useCallback(
    (date: Date, disabledDates: Date[]): Date => {
      // If date is not disabled, return it as is
      if (
        !disabledDates.some((d) => d.toDateString() === date.toDateString())
      ) {
        return date;
      }

      const year = date.getFullYear();
      const month = date.getMonth();
      const currentDate = date.getDate();

      // Check next dates in the same month
      for (let i = 1; i <= 31; i++) {
        const nextDate = new Date(year, month, currentDate + i);
        // If we've moved to next month, stop searching
        if (nextDate.getMonth() !== month) break;

        if (
          !disabledDates.some(
            (d) => d.toDateString() === nextDate.toDateString()
          )
        ) {
          return nextDate;
        }
      }

      // Check previous dates in the same month
      for (let i = 1; i <= 31; i++) {
        const prevDate = new Date(year, month, currentDate - i);
        // If we've moved to previous month, stop searching
        if (prevDate.getMonth() !== month) break;

        if (
          !disabledDates.some(
            (d) => d.toDateString() === prevDate.toDateString()
          )
        ) {
          return prevDate;
        }
      }

      // If no valid date found in the same month, return the original date
      return date;
    },
    []
  );

  // Initialize date with default value or tomorrow's date, and validate it against disabled dates
  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (defaultValue) {
      const from = defaultValue.from
        ? findNearestValidDate(defaultValue.from, [])
        : undefined;
      const to = defaultValue.to
        ? findNearestValidDate(defaultValue.to, [])
        : undefined;
      return { from, to };
    }
    const tomorrow = addDays(new Date(), 1);
    return { from: findNearestValidDate(tomorrow, []) };
  });
  const [isPopupDepartDateOpen, setIsPopupDepartDateOpen] = useState(false);
  const [isPopupReturnDateOpen, setIsPopupReturnDateOpen] = useState(false);

  const isMobile = useCheckMobile();
  const numberOfMonths = isMobile ? 1 : 2;

  // Get disabled dates for departure and return trips

  // Update currentMonth when calendar navigates
  const handleMonthChange = useCallback(
    (newMonth: Date) => {
      setCurrentMonth?.(newMonth);
    },
    [setCurrentMonth]
  );

  const handleMonthChangeReturn = useCallback(
    (newMonth: Date) => {
      setCurrentMonthReturn?.(newMonth);
    },
    [setCurrentMonthReturn]
  );

  const [needUpdateDate, setNeedUpdateDate] = useState(false);

  // Update date when disabled dates change to ensure we don't have a disabled date selected
  useEffect(() => {
    if (!date) return;

    const updateDate = () => {
      let newFrom = date.from;
      let newTo = date.to;
      let needsUpdate = false;

      // Check and update departure date if needed
      if (
        date.from &&
        disabledDepartureDates?.some(
          (d) => d.toDateString() === date.from?.toDateString()
        )
      ) {
        newFrom = findNearestValidDate(date.from, disabledDepartureDates);
        needsUpdate = true;
      }

      // Check and update return date if needed
      if (
        date.to &&
        disabledReturnDates?.some(
          (d) => d.toDateString() === date.to?.toDateString()
        )
      ) {
        newTo = findNearestValidDate(date.to, disabledReturnDates);
        needsUpdate = true;
      }

      if (needsUpdate && !needUpdateDate) {
        setDate({
          from: newFrom,
          to: newTo,
        });
        setNeedUpdateDate(true);
      }
    };

    // Small timeout to ensure disabled dates are updated
    const timer = setTimeout(updateDate, 100);
    return () => clearTimeout(timer);
  }, [
    disabledDepartureDates,
    disabledReturnDates,
    date,
    findNearestValidDate,
    needUpdateDate,
  ]);

  // Trigger onValueChange every time date is updated
  useEffect(() => {
    if (onValueChange && date) {
      onValueChange(date);
    }
  }, [date, onValueChange]);

  const getCorrectFromDate = useCallback(
    (newDate: DateRange) => {
      if (newDate.from && !newDate.to) return newDate.from;
      if (newDate.to && !newDate.from) return newDate.to;
      if (newDate.from && newDate.to)
        return newDate.from !== date?.from ? newDate.from : newDate.to;
      return addDays(new Date(), 1);
    },
    [date?.from]
  );

  const handleSetDepartDate = useCallback(
    (newDate: DateRange | undefined) => {
      if (!newDate) {
        newDate = { from: addDays(new Date(), 1) };
      }
      const fromDate = getCorrectFromDate(newDate);

      // Check if the selected date is disabled
      const isDisabled = disabledDepartureDates?.some(
        (d) => d.toDateString() === fromDate.toDateString()
      );

      if (isDisabled) {
        // Find the next available date if the selected one is disabled
        const nextAvailable = findNearestValidDate(
          fromDate,
          disabledDepartureDates ?? []
        );
        fromDate.setTime(nextAvailable.getTime());
      }

      if (date?.to && fromDate >= date.to) {
        setDate({ from: fromDate });
      } else {
        setDate({ from: fromDate, to: date?.to });
      }
      setIsPopupDepartDateOpen(false);
      setOpenStartDate?.(false);
    },
    [
      getCorrectFromDate,
      disabledDepartureDates,
      date?.to,
      setOpenStartDate,
      findNearestValidDate,
    ]
  );

  const handleSetReturnDate = useCallback(
    (newDate: DateRange | undefined) => {
      if (!newDate?.to) {
        setDate({ from: date?.from });
        setIsPopupReturnDateOpen(false);
        setOpenEndDate?.(false);
        return;
      }

      // Check if the selected return date is disabled
      const isDisabled = disabledReturnDates?.some(
        (d) => d.toDateString() === newDate.to?.toDateString()
      );

      let returnDate = newDate.to;

      if (isDisabled) {
        // Find the next available date if the selected one is disabled
        const nextAvailable = findNearestValidDate(
          returnDate,
          disabledReturnDates ?? []
        );
        returnDate = nextAvailable;
      }

      // Ensure return date is not before departure date
      if (date?.from && returnDate < date.from) {
        returnDate = date.from;
      }

      setDate({ from: date?.from, to: returnDate });
      setIsPopupReturnDateOpen(false);
      setOpenEndDate?.(false);
    },
    [date?.from, disabledReturnDates, findNearestValidDate, setOpenEndDate]
  );

  const handleClearReturnDate = useCallback(() => {
    setDate({ from: date?.from });
  }, [date?.from]);

  const classNames = useMemo(
    () => ({
      row: "grid grid-cols-7 w-full mt-2 justify-items-stretch",
      head_row:
        "grid grid-cols-7 w-full md:justify-normal md:flex justify-items-center",
      months: "flex flex-col md:flex-row space-y-4 md:space-x-4 md:space-y-0",
      day_today: "bg-primary-100 text-accent-foreground",
      cell: cn(
        "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
      ),
      day: cn(
        buttonVariants({ variant: "ghost" }),
        "h-8 w-full p-0 font-normal aria-selected:opacity-100"
      ),
      day_disabled: cn(
        "text-muted-foreground opacity-50 cursor-not-allowed hover:bg-transparent",
        // Always apply line-through to disabled days
        "line-through"
      ),
      day_outside: cn(
        "text-muted-foreground opacity-50",
        // Also apply line-through to days outside the current month
        "line-through"
      ),
      day_range_middle:
        "aria-selected:bg-accent aria-selected:text-accent-foreground",
      day_hidden: "invisible",
    }),
    []
  );

  const onOpenChange = useCallback(
    (open: boolean) => {
      setOpenStartDate?.(open);
      setIsPopupDepartDateOpen(open);
    },
    [setOpenStartDate]
  );

  const onOpenChangeReturn = useCallback(
    (open: boolean) => {
      setOpenEndDate?.(open);
      setIsPopupReturnDateOpen(open);
    },
    [setOpenEndDate]
  );

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {/* Departure date */}
      <div className="flex w-full flex-1 items-center rounded-lg border border-default-400 bg-white px-3 py-1 lg:w-2/12 lg:min-w-[160px]">
        <Popover open={isPopupDepartDateOpen} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "flex h-10 w-full flex-col items-start justify-start p-0",
                !date && "text-muted-foreground",
                "border-none shadow-none hover:bg-transparent",
                "text-sm"
              )}
            >
              <div className="flex flex-1 items-center gap-1">
                <IoCalendarClearOutline className="h-4 w-4" />
                <p className="text-xs">{t("departureDate.label")}</p>
              </div>
              <p className="pl-5 pr-1 text-left font-normal">
                {date?.from ? (
                  <>{format(date.from, "dd/MM/yyyy")}</>
                ) : (
                  <>{t("departureDate.placeholder")}</>
                )}
              </p>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={cn("popover-content w-full max-w-full rounded-lg")}
            forceMount
            sideOffset={8}
            align="center"
            side="bottom"
          >
            <Calendar
              showOutsideDays={false}
              locale={locale}
              initialFocus
              mode="range"
              className="p-0"
              classNames={classNames}
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleSetDepartDate}
              numberOfMonths={numberOfMonths}
              disabled={disabledDepartureDates}
              // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
              fromMonth={new Date()}
              onMonthChange={handleMonthChange}
            />
            <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-gray-300">
                  16
                </span>
                <span>Ngày có chuyến</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-gray-300 text-gray-400">
                  <span className="line-through">16</span>
                </span>
                <span>Ngày không có chuyến</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Return date */}
      <div className="flex w-full flex-1 items-center gap-1 rounded-lg border border-default-400 bg-white px-3 py-1 lg:w-2/12 lg:min-w-[160px]">
        <Popover open={isPopupReturnDateOpen} onOpenChange={onOpenChangeReturn}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "flex h-10 w-full flex-col items-start justify-start p-0",
                !date && "text-muted-foreground",
                "border-none shadow-none hover:bg-transparent",
                "text-sm"
              )}
            >
              <div className="flex flex-1 items-center gap-1">
                <IoCalendarClearOutline className="h-4 w-4" />
                <p className="text-xs">{t("returnDate.label")}</p>
              </div>
              <p className="pl-5 pr-1 text-left font-normal">
                {date?.to ? (
                  <>{format(date.to, "dd/MM/yyyy")}</>
                ) : (
                  <>{t("returnDate.placeholder")}</>
                )}
              </p>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={cn("popover-content w-full max-w-full rounded-lg")}
            forceMount
            sideOffset={8}
            align="center"
            side="bottom"
          >
            <Calendar
              showOutsideDays={false}
              initialFocus
              locale={locale}
              mode="range"
              className="p-0"
              classNames={classNames}
              defaultMonth={date?.to}
              selected={date}
              onSelect={handleSetReturnDate}
              numberOfMonths={numberOfMonths}
              disabled={disabledReturnDates}
              // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
              fromMonth={date?.from ?? new Date()}
              onMonthChange={handleMonthChangeReturn}
            />
            <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-gray-300">
                  16
                </span>
                <span>Ngày có chuyến</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-gray-300 text-gray-400">
                  <span className="line-through">16</span>
                </span>
                <span>Ngày không có chuyến</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {date?.to && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"outline"}
                aria-label={t("returnDate.clear")}
                className="h-6 w-6 min-w-0 flex-none rounded border-none bg-primary-100 p-1 shadow-none hover:bg-primary-300"
                disabled={!date?.to}
                onClick={handleClearReturnDate}
                size={"icon"}
              >
                <IoClose className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-background text-foreground shadow">
              <p>{t("returnDate.clear")}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export default memo(DatePickerWithRange);
