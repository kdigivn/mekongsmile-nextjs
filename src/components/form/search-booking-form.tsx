/* eslint-disable @arthurgeron/react-usememo/require-usememo */
"use client";

import { objectToArray } from "@/services/helpers/objectUtils";
import { useTranslation } from "@/services/i18n/client";
import { useRouter } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import Calendar from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingStatusEnum } from "@/services/apis/bookings/types/booking-status-enum";
import { BookingSearchParams } from "@/app/(language)/user/bookings/booking-search-param-type";
import { enumToArray } from "@/services/helpers/enumUtils";
import useLanguage from "@/services/i18n/use-language";
import { getLocaleByKey } from "@/services/helpers/get-locale-by-key";
import { MdOutlineRestartAlt } from "react-icons/md";

type Props = {
  /**
   * Default departure id
   */
  initId?: string;
  /**
   * Default destination id
   */
  initOrdererName?: string;
  /**
   * Default from date
   */
  initCreatedAtFrom?: string;
  /**
   * Default to date
   */
  initCreatedAtTo?: string;
  /**
   * Default number of passengers
   */
  initBookingStatus?: number[];
  /**
   * Routes fetch in server component
   */
  className?: string;
};

const SearchBookingForm = ({
  initId,
  initOrdererName,
  initCreatedAtFrom,
  initCreatedAtTo,
  initBookingStatus,
  className,
}: Props) => {
  const hasFilter =
    initId ||
    initOrdererName ||
    initCreatedAtFrom ||
    initCreatedAtTo ||
    (initBookingStatus && initBookingStatus?.length > 0);
  const { t: bookingFormTranslation } = useTranslation("user/bookings");
  const { t: bookingStatusTranslation } = useTranslation(
    "booking/booking-status"
  );
  const language = useLanguage();
  const locale = getLocaleByKey(language);

  const router = useRouter();
  const [bookingId, setBookingId] = useState(initId ?? "");
  const [ordererName, setOrdererName] = useState(initOrdererName ?? "");
  // const [createdDate, setCreatedDate] = useState(
  //   initCreatedDate ? new Date(initCreatedDate) : new Date()
  // );
  const [createdAtFrom, setCreatedAtFrom] = useState(
    initCreatedAtFrom ? new Date(initCreatedAtFrom) : new Date()
  );
  const [createdAtTo, setCreatedAtTo] = useState(
    initCreatedAtTo ? new Date(initCreatedAtTo) : new Date()
  );
  const [bookingStatus, setBookingStatus] = useState<string>(
    initBookingStatus && initBookingStatus?.length > 0
      ? initBookingStatus.toString()
      : ""
  );
  const [isSelectedDateFrom, setIsSelectDateFrom] = useState(false);

  const [isSelectedDateTo, setIsSelectDateTo] = useState(false);

  const handleSearchAction = useCallback(() => {
    const filtersRequest: BookingSearchParams = {
      page: 0,
      limit: 50,
      id: bookingId,
      createdAtFrom:
        initCreatedAtFrom || isSelectedDateFrom
          ? formatDate(createdAtFrom ?? "", "yyyy-MM-dd")
          : "",
      createdAtTo:
        initCreatedAtTo || isSelectedDateTo
          ? formatDate(createdAtTo ?? "", "yyyy-MM-dd")
          : "",
      picName: ordererName,
      booking_statuses: parseInt(bookingStatus),
    };

    // const queryParams: BookingSearchFormParams = {
    //   filters: filtersRequest,
    // };

    // Create query path. Add a timestamp to trigger API fetch when click search button
    const path = `/user/bookings?${objectToArray(filtersRequest)
      .filter((item) => item.value)
      .map((item) => `${item.key}=${item.value}`)
      .join("&")}`;

    router.push(path);
  }, [
    bookingId,
    initCreatedAtFrom,
    isSelectedDateFrom,
    createdAtFrom,
    initCreatedAtTo,
    isSelectedDateTo,
    createdAtTo,
    ordererName,
    bookingStatus,
    router,
  ]);

  const handleResetAction = useCallback(() => {
    const path = `/user/bookings`;

    router.push(path);
  }, [router]);

  const bookingStatusArray = enumToArray(BookingStatusEnum);

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 rounded-md bg-white p-3",
        className
      )}
    >
      {/* Select Passengers */}
      <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="col-span-1 flex w-full flex-col gap-3">
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold">
              {bookingFormTranslation("form.booking-id.title")}
            </p>
          </div>
          <Input
            placeholder={bookingFormTranslation("form.booking-id.placeholder")}
            className="border-default-600 px-3 placeholder:text-xs focus:border-primary focus-visible:ring-primary"
            type="text"
            value={bookingId}
            onChange={(event) => {
              setBookingId(event.target.value);
            }}
            min={1}
            max={50}
          />
        </div>

        <div className="col-span-1 flex w-full flex-col gap-3">
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold">
              {bookingFormTranslation("form.pic-name.title")}
            </p>
          </div>
          <Input
            placeholder={bookingFormTranslation("form.pic-name.placeholder")}
            className="border-default-600 px-3 placeholder:text-xs focus:border-primary focus-visible:ring-primary"
            type="text"
            value={ordererName}
            onChange={(event) => {
              setOrdererName(event.target.value);
            }}
            min={1}
            max={50}
          />
        </div>

        <div className="col-span-1 flex w-full flex-col gap-3">
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold">
              {bookingFormTranslation("form.created-date-from.title")}
            </p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-between border-default-600 px-3 text-left text-xs font-normal placeholder:text-xs data-[state=open]:border-primary data-[state=open]:ring-1 data-[state=open]:ring-primary",
                  !createdAtFrom && "text-muted-foreground"
                )}
              >
                {initCreatedAtFrom || isSelectedDateFrom ? (
                  formatDate(createdAtFrom ?? "", "dd/MM/yyyy")
                ) : (
                  <span>
                    {bookingFormTranslation(
                      "form.created-date-from.placeholder"
                    )}
                  </span>
                )}
                <CalendarIcon className="mr-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                locale={locale}
                mode="single"
                selected={createdAtFrom}
                onSelect={(value) => {
                  setIsSelectDateFrom(true);
                  setCreatedAtFrom(value ? new Date(value) : new Date());
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="col-span-1 flex w-full flex-col gap-3">
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold">
              {bookingFormTranslation("form.created-date-to.title")}
            </p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-between border-default-600 px-3 text-left text-xs font-normal placeholder:text-xs data-[state=open]:border-primary data-[state=open]:ring-1 data-[state=open]:ring-primary",
                  !createdAtTo && "text-muted-foreground"
                )}
              >
                {initCreatedAtTo || isSelectedDateTo ? (
                  formatDate(createdAtTo ?? "", "dd/MM/yyyy")
                ) : (
                  <span>
                    {bookingFormTranslation("form.created-date-to.placeholder")}
                  </span>
                )}
                <CalendarIcon className="mr-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                locale={locale}
                mode="single"
                selected={createdAtTo}
                onSelect={(value) => {
                  setIsSelectDateTo(true);
                  setCreatedAtTo(value ? new Date(value) : new Date());
                }}
                disabled={(date) =>
                  createdAtFrom ? date < createdAtFrom : false
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="col-span-1 flex w-full flex-col gap-3">
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold">Trạng thái</p>
          </div>
          <Select value={bookingStatus} onValueChange={setBookingStatus}>
            <SelectTrigger className="w-full border-default-600 px-3 text-left text-xs font-normal placeholder:text-xs data-[state=open]:border-primary data-[state=open]:ring-1 data-[state=open]:ring-primary">
              <SelectValue
                placeholder={bookingFormTranslation("form.status.placeholder")}
              />
            </SelectTrigger>
            <SelectContent>
              {bookingStatusArray.slice(1).map((item) => (
                <SelectItem key={item.value} value={item.value.toString()}>
                  {bookingStatusTranslation(item.value.toString())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={handleSearchAction}
          size="lg"
          className="flex h-10 flex-none justify-between gap-2 rounded-md border border-primary px-4 py-3 lg:w-[150px]"
        >
          {bookingFormTranslation("form.submit")}
          <IoIosSearch className="h-6 w-6" />
        </Button>
        {hasFilter && (
          <Button
            onClick={handleResetAction}
            size="lg"
            className="flex h-10 flex-none justify-between gap-2 rounded-md bg-primary-100 px-4 py-3 text-primary hover:bg-primary hover:text-primary-foreground lg:w-[110px]"
          >
            {bookingFormTranslation("form.reset")}
            <MdOutlineRestartAlt className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default memo(SearchBookingForm);
