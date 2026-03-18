"use client";

import { useTranslation } from "@/services/i18n/client";
import { Card } from "@/components/ui/card";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGetBooking } from "@/services/apis/bookings/bookings.service";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import PaymentGatewayLoader from "./loader/issue-ticket-loader";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import {
  BookingValidationErrors,
  OperatorOrderErrors,
  OrderIssueTicketErrors,
} from "@/services/apis/common/types/common-errors";
import { isAfter } from "date-fns";
import { BookingStatusEnum } from "@/services/apis/bookings/types/booking-status-enum";
import { NotFoundView } from "@/views/error";
import ExportTicketModal from "../_components/_card/export-ticket-issue-error-card";

function Payment() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation("booking");
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

  const { booking: bookingData, bookingLoading } = useGetBooking(
    bookingId,
    !!bookingId
  );

  const hasDepartError = !!bookingData?.depart_order?.issue_ticket_error;
  const hasReturnError = !!bookingData?.return_order?.issue_ticket_error;
  const defaultTab = hasDepartError ? "depart" : "return";
  const checkExportTicket =
    hasDepartError ||
    hasReturnError ||
    bookingData?.booking_status === BookingStatusEnum.Booked;

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
    (checkSuccess: boolean, currentIssueError?: number | null) => {
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
        checkSuccess ||
        checkExportTicket
      ) {
        return `/user/bookings/${bookingId}?payment_method=${paymentMethod}&booking_id=${bookingId}&agreedTerms=${agreedTerms}`;
      }
      return `/booking/${bookingId}?payment_method=${paymentMethod}&booking_id=${bookingId}&agreedTerms=${agreedTerms}`;
    },
    [
      bookingData?.booking_status,
      checkExportTicket,
      bookingId,
      paymentMethod,
      agreedTerms,
    ]
  );

  // Simplify handleRedirectToBooking to not depend on issueError
  const handleRedirectToBooking = useCallback(
    (checkSuccess: boolean, errorCode?: number | null) => {
      const url = getRedirectUrl(checkSuccess, errorCode);
      router.push(url);
    },
    [getRedirectUrl, router]
  );

  // const handleConfirmIssueAndRedirect = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     setCheckRunOnce(true);
  //     // Chạy confirmIssue và đợi nó hoàn thành
  //     const { data, status } = await confirmIssue({
  //       id: bookingId,
  //     });
  //     if (status === HTTP_CODES_ENUM.NO_CONTENT) {
  //       setLoading(false);
  //       setCheckSuccess(true);
  //       setCountdown(3);
  //       setTimeout(() => {
  //         handleRedirectToBooking(true);
  //       }, 3000); // chờ n giây trước khi chuyển hướng

  //       return;
  //     } else {
  //       if (
  //         ((data?.errors as CommonAPIErrors)?.errorCode as number) !==
  //           BookingValidationErrors.AlreadyProcessingIssueTicket ||
  //         (data?.errors as CommonAPIErrors).errorCode
  //       ) {
  //         setLoading(false);
  //       }
  //       if (data?.errors) {
  //         if ((data?.errors as CommonAPIErrors)?.errorCode) {
  //           setIssueError(
  //             (data?.errors as CommonAPIErrors)?.errorCode as number
  //           );
  //         } else {
  //           setIssueError(BookingUnknownErrors.Unknown);
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     // Xử lý bất kỳ lỗi nào xảy ra trong quá trình
  //     setLoading(false);
  //     console.error("Error in confirm issue process:", error);
  //   }
  // }, [bookingId, confirmIssue, handleRedirectToBooking]);

  const handleCheckIssueTicketAndRedirect = useCallback(() => {
    setLoading(true);
    setCheckRunOnce(true);
    if (bookingData?.booking_status === BookingStatusEnum.Booked) {
      setLoading(false);
      setCheckSuccess(true);
      setCountdown(3);
      setTimeout(() => {
        handleRedirectToBooking(true);
      }, 3000); // chờ n giây trước khi chuyển hướng

      return;
    } else {
      setLoading(false);
    }
  }, [bookingData?.booking_status, handleRedirectToBooking]);

  // Thay thế useEffect hiện tại bằng:
  useEffect(() => {
    if (!checkRunOnce) {
      // handleConfirmIssueAndRedirect();
      handleCheckIssueTicketAndRedirect();
    }
  }, [checkRunOnce, handleCheckIssueTicketAndRedirect]);

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

  const handleRedirectIssueTicketAgain = useCallback(() => {
    router.push(
      `/booking/${bookingId}/issue-ticket/?payment_method=${paymentMethod}&booking_id=${bookingId}&agreedTerms=${agreedTerms}`
    );
  }, [agreedTerms, bookingId, paymentMethod, router]);

  const handleRedirectToBookingCallback = useCallback(
    (errorCode?: number | null) => {
      handleRedirectToBooking(false, errorCode);
    },
    [handleRedirectToBooking]
  );

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

  const onClick = useCallback(
    () => handleRedirectToBookingCallback(),
    [handleRedirectToBookingCallback]
  );
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
      onCloseClick={onClick}
      isDisabledEdit={isDisabledEdit}
      handleClickEditIconButton={handleClickEditIconButton}
      handleRedirectIssueTicketAgain={handleRedirectIssueTicketAgain}
    />
  );
}

export default memo(withPageRequiredAuth(Payment));
