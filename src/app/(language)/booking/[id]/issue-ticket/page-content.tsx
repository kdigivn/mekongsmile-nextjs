"use client";

import { useTranslation } from "@/services/i18n/client";
import { Card } from "@/components/ui/card";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  useBookingPostConfirmToIssue,
  useGetBooking,
} from "@/services/apis/bookings/bookings.service";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import PaymentGatewayLoader from "./loader/issue-ticket-loader";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import {
  BookingUnknownErrors,
  BookingValidationErrors,
  OperatorOrderErrors,
  OrderIssueTicketErrors,
} from "@/services/apis/common/types/common-errors";
import { isAfter } from "date-fns";
import { BookingStatusEnum } from "@/services/apis/bookings/types/booking-status-enum";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { CommonAPIErrors } from "@/services/apis/common/types/validation-errors";
import { NotFoundView } from "@/views/error";
import ExportTicketModal from "../_components/_card/export-ticket-issue-error-card";

function Payment() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation("booking");
  const [issueError, setIssueError] = useState<number | null>(null);
  const bookingId = useMemo(() => params.id as string, [params.id]);
  const paymentMethod = searchParams.get("payment_method") ?? "";
  const agreedTerms = searchParams.get("agreedTerms") ?? "";
  // const redirectBack = searchParams.get("redirectBack") ?? "";
  const [loading, setLoading] = useState<boolean>(false);
  // Check run onece
  const [checkRunOnce, setCheckRunOnce] = useState<boolean>(false);

  const [checkSuccess, setCheckSuccess] = useState<boolean>(false);

  const [countdown, setCountdown] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // useRef to store interval
  const [isCountdownFinished, setIsCountdownFinished] = useState(false);

  const {
    booking: bookingData,
    bookingLoading,
    bookingRefetch,
  } = useGetBooking(bookingId, !!bookingId);

  const hasDepartError = !!bookingData?.depart_order?.issue_ticket_error;
  const hasReturnError = !!bookingData?.return_order?.issue_ticket_error;
  const defaultTab = hasDepartError ? "depart" : "return";
  const checkExportTicket =
    hasDepartError ||
    hasReturnError ||
    bookingData?.booking_status === BookingStatusEnum.Booked;

  useEffect(() => {
    if (issueError) {
      bookingRefetch();
    }
  }, [bookingRefetch, issueError]);

  const confirmIssue = useBookingPostConfirmToIssue();

  /**
   * handleClickEditIconButton is a useCallback hook that handles the click event for editing the voyage ticket data.
   * It constructs a URL based on the stored voyage data and navigates to it.
   *
   * @returns {void} - This function does not return a value.
   *
   * The useCallback hook ensures that the same function instance is returned as long as the `router` dependency does not change.
   */
  const handleClickEditIconButton = useCallback(() => {
    // Config URL
    let URL = "/ticket-detail/";
    if (bookingData?.depart_order?.voyage_id) {
      URL += `?departVoyageId=${bookingData?.depart_order?.voyage_id}`;
    }

    if (bookingData?.return_order?.voyage_id) {
      URL += `&returnVoyageId=${bookingData?.return_order?.voyage_id}`;
    }

    if (bookingData?.depart_order?.id) {
      URL += `&depart_order_id=${bookingData?.depart_order?.id}`;
    }

    if (bookingData?.return_order?.id) {
      URL += `&return_order_id=${bookingData?.return_order?.id}`;
    }

    URL += `&numberOfPassengers=${1}`;
    // Check if edit ticket
    URL += `&mode=edit`;
    // Booking ID
    URL += `&booking_id=${bookingId}`;

    router.push(URL);
  }, [
    bookingData?.depart_order?.id,
    bookingData?.depart_order?.voyage_id,
    bookingData?.return_order?.id,
    bookingData?.return_order?.voyage_id,
    bookingId,
    router,
  ]);

  // Separate the URL construction logic
  const getRedirectUrl = useCallback(
    (checkSuccess: boolean, currentIssueError: number | null) => {
      if (
        currentIssueError ===
          OperatorOrderErrors.CreateOrderFailedDueToUnavailableSeats ||
        currentIssueError === OrderIssueTicketErrors.UnavailableSeats ||
        currentIssueError ===
          BookingValidationErrors.CustomerBalanceNotEnough ||
        currentIssueError ===
          BookingValidationErrors.OrganizationBalanceNotEnough ||
        currentIssueError === BookingValidationErrors.InvalidStatus ||
        bookingData?.booking_status === BookingStatusEnum.Booked ||
        checkSuccess
      ) {
        return `/user/bookings/${bookingId}?payment_method=${paymentMethod}&booking_id=${bookingId}&agreedTerms=${agreedTerms}`;
      }
      return `/booking/${bookingId}?payment_method=${paymentMethod}&booking_id=${bookingId}&agreedTerms=${agreedTerms}`;
    },
    [bookingId, paymentMethod, agreedTerms, bookingData?.booking_status]
  );

  // Simplify handleRedirectToBooking to not depend on issueError
  const handleRedirectToBooking = useCallback(
    (checkSuccess: boolean) => {
      const url = getRedirectUrl(checkSuccess, issueError);
      router.push(url);
    },
    [getRedirectUrl, issueError, router]
  );

  const handleConfirmIssueAndRedirect = useCallback(async () => {
    try {
      setLoading(true);
      setCheckRunOnce(true);
      // Chạy confirmIssue và đợi nó hoàn thành
      const { data, status } = await confirmIssue({
        id: bookingId,
      });
      if (status === HTTP_CODES_ENUM.OK) {
        setLoading(false);
        setCheckSuccess(true);
        setCountdown(3);
        setTimeout(() => {
          handleRedirectToBooking(true);
        }, 3000); // chờ n giây trước khi chuyển hướng

        return;
      } else {
        if (
          ((data?.errors as CommonAPIErrors)?.errorCode as number) !==
            BookingValidationErrors.AlreadyProcessingIssueTicket ||
          (data?.errors as CommonAPIErrors).errorCode
        ) {
          setLoading(false);
        }
        if (data?.errors) {
          if ((data?.errors as CommonAPIErrors)?.errorCode) {
            setIssueError(
              (data?.errors as CommonAPIErrors)?.errorCode as number
            );
          } else {
            setIssueError(BookingUnknownErrors.Unknown);
          }
        }
      }
    } catch (error) {
      // Xử lý bất kỳ lỗi nào xảy ra trong quá trình
      setLoading(false);
      console.error("Error in confirm issue process:", error);
    }
  }, [bookingId, confirmIssue, handleRedirectToBooking]);

  // Thay thế useEffect hiện tại bằng:
  useEffect(() => {
    if (!checkRunOnce) {
      handleConfirmIssueAndRedirect();
    }
  }, [checkRunOnce, handleConfirmIssueAndRedirect]);

  const isDisabledEdit = useMemo(() => {
    const now = new Date();
    const departDate = new Date(
      `${bookingData?.depart_order?.voyage?.departure_date}T${bookingData?.depart_order?.voyage?.depart_time}`
    );
    const returnDate = new Date(
      `${bookingData?.return_order?.voyage?.departure_date}T${bookingData?.return_order?.voyage?.depart_time}`
    );
    if (isAfter(now, departDate) || isAfter(now, returnDate)) {
      return true;
    }

    if (
      bookingData?.booking_status === BookingStatusEnum.Booked ||
      bookingData?.booking_status === BookingStatusEnum.CancelRequest ||
      bookingData?.booking_status === BookingStatusEnum.Cancelled ||
      bookingData?.booking_status ===
        BookingStatusEnum.CancelledBecauseBoatNotDepart
    ) {
      return true;
    }
    return false;
  }, [
    bookingData?.booking_status,
    bookingData?.depart_order?.voyage?.depart_time,
    bookingData?.depart_order?.voyage?.departure_date,
    bookingData?.return_order?.voyage?.depart_time,
    bookingData?.return_order?.voyage?.departure_date,
  ]);

  const handleRedirectToBookingCallback = useCallback(() => {
    handleRedirectToBooking(false);
  }, [handleRedirectToBooking]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown((prevCountdown) =>
          prevCountdown !== null ? prevCountdown - 1 : null
        );
      }, 1000);
    } else if (countdown === 0) {
      setIsCountdownFinished(true);
      clearInterval(intervalRef.current as NodeJS.Timeout); // Clear interval when countdown reaches 0
      intervalRef.current = null;
    }

    // Cleanup function to clear the interval on component unmount
    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [countdown]); // only depend on countdown

  return bookingLoading || loading || checkSuccess ? (
    <Card className="mx-auto my-4 flex w-full max-w-fit items-center justify-center">
      <PaymentGatewayLoader
        isSuccess={checkSuccess}
        isCountdownFinished={isCountdownFinished}
        countdown={countdown}
      />
    </Card>
  ) : !bookingData ? (
    <NotFoundView
      messageTitle={t("error.not-found-booking")}
      messageDesription={t("error.not-found-booking-description")}
    />
  ) : (
    <ExportTicketModal
      bookingData={bookingData}
      bookingId={bookingId}
      checkExportTicket={checkExportTicket}
      hasDepartError={hasDepartError}
      hasReturnError={hasReturnError}
      defaultTab={defaultTab}
      isDisabledEdit={isDisabledEdit}
      handleClickEditIconButton={handleClickEditIconButton}
      onCloseClick={handleRedirectToBookingCallback}
    />
    // <Card className="mx-auto my-4 w-full max-w-md border-destructive/20">
    //   <>
    //     <CardHeader className="pb-3">
    //       <div className="flex items-center justify-between">
    //         <CardTitle className="flex items-center gap-2 text-lg">
    //           {t("export-ticket-modal.export")}{" "}
    //           <Badge variant="destructive">
    //             {t("export-ticket-modal.export-fail")}
    //           </Badge>
    //         </CardTitle>
    //       </div>
    //     </CardHeader>

    //     <Separator />
    //     {checkExportTicket ? (
    //       <Tabs defaultValue={defaultTab} className="w-full">
    //         <TabsList className="mx-4 mt-4 grid grid-cols-2">
    //           <TabsTrigger
    //             value="depart"
    //             className="flex items-center gap-1"
    //             disabled={!hasDepartError}
    //           >
    //             <MdArrowForward className="h-3.5 w-3.5" />
    //             Chiều đi
    //           </TabsTrigger>
    //           <TabsTrigger
    //             value="return"
    //             className="flex items-center gap-1"
    //             disabled={!hasReturnError}
    //           >
    //             <MdArrowBack className="h-3.5 w-3.5" />
    //             Chiều về
    //           </TabsTrigger>
    //         </TabsList>

    //         <TabsContent value="depart" className="mt-0">
    //           <CardContent className="pt-4">
    //             {bookingData?.depart_order && (
    //               <div className="mb-4 rounded-lg bg-muted/50 p-3">
    //                 <div className="mb-1 flex items-center gap-1 text-sm font-medium">
    //                   <IoLocationOutline className="hidden h-5 w-5 md:flex" />
    //                   <div className="flex items-center">
    //                     {bookingData?.depart_order?.voyage?.route?.departure
    //                       .location_name ?? ""}
    //                     <IoIosArrowRoundForward className="h-5 w-5" />
    //                     {bookingData?.depart_order?.voyage?.route?.destination
    //                       .location_name ?? ""}
    //                   </div>
    //                 </div>
    //                 <div className="flex items-center gap-1 text-xs text-muted-foreground">
    //                   <CiCalendar className="h-5 w-5" />
    //                   <div>
    //                     {`${format(new Date(`${bookingData?.depart_order?.voyage?.departure_date}T${bookingData?.depart_order?.voyage?.depart_time}`), "HH:mm - dd/MM/yyyy")}`}
    //                   </div>
    //                 </div>
    //               </div>
    //             )}
    //             {bookingData?.depart_order?.issue_ticket_error &&
    //             bookingData?.depart_order?.order_status !==
    //               OrderStatusEnum.Booked ? (
    //               <>{renderErrorContent()}</>
    //             ) : (
    //               <>Chưa xuất vé</>
    //             )}
    //           </CardContent>
    //         </TabsContent>

    //         <TabsContent value="return" className="mt-0">
    //           <CardContent className="pt-4">
    //             {bookingData?.return_order && (
    //               <div className="mb-4 rounded-lg bg-muted/50 p-3">
    //                 <div className="mb-1 flex items-center gap-1 text-sm font-medium">
    //                   <IoLocationOutline className="h-5 w-5" />
    //                   <div className="flex items-center">
    //                     {bookingData?.return_order?.voyage?.route?.departure
    //                       .location_name ?? ""}
    //                     <IoIosArrowRoundForward className="h-5 w-5" />
    //                     {bookingData?.return_order?.voyage?.route?.destination
    //                       .location_name ?? ""}
    //                   </div>
    //                 </div>
    //                 <div className="flex items-center gap-1 text-xs text-muted-foreground">
    //                   <CiCalendar className="h-5 w-5" />
    //                   <div>
    //                     {`${format(new Date(`${bookingData?.return_order?.voyage?.departure_date}T${bookingData?.return_order?.voyage?.depart_time}`), "HH:mm dd/MM/yyyy")}`}
    //                   </div>
    //                 </div>
    //               </div>
    //             )}

    //             {bookingData?.return_order?.issue_ticket_error &&
    //             bookingData?.return_order?.order_status !==
    //               OrderStatusEnum.Booked ? (
    //               <>{renderErrorContent()}</>
    //             ) : (
    //               <>Chưa xuất vé</>
    //             )}
    //           </CardContent>
    //         </TabsContent>
    //       </Tabs>
    //     ) : (
    //       <CardContent className="pt-4">
    //         <p>Đơn {bookingId} chưa xuất vé</p>
    //       </CardContent>
    //     )}
    //     <CardFooter className="justify-end">
    //       <Button
    //         className="gap-1 bg-transparent text-black shadow-none hover:bg-gray-100"
    //         onClick={handleRedirectToBookingCallback}
    //       >
    //         {t("export-ticket-modal.iUnderstand")}
    //       </Button>
    //     </CardFooter>
    //   </>
    // </Card>
  );
}

export default memo(withPageRequiredAuth(Payment));
