"use client";

import BookingStep from "@/components/page-section/booking-step";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetBoatLayoutFromDatabaseOfVoyageService } from "@/services/apis/boatLayouts/boatlayout.service";
import { BoatLayout } from "@/services/apis/boatLayouts/types/boat-layout";
import { Booking } from "@/services/apis/bookings/types/booking";
import { BookingStatusEnum } from "@/services/apis/bookings/types/booking-status-enum";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { Order } from "@/services/apis/orders/types/order";
import { Ticket } from "@/services/apis/tickets/types/ticket";
import { TicketPrice } from "@/services/apis/tickets/types/ticket-price";
import { Voyage } from "@/services/apis/voyages/types/voyage";
import { useGetVoyageService } from "@/services/apis/voyages/voyages.service";
import { Radio, RadioGroup } from "@heroui/radio";
import { Checkbox } from "@heroui/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
// import { Transaction } from "@/services/apis/bookings/transactions/types/transaction";
import { useTranslation } from "@/services/i18n/client";
// import PaymentModal from "./_components/_modal/payment-modal";
import { useGetBooking } from "@/services/apis/bookings/bookings.service";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import PaymentMethodModal from "./_components/_modal/payment-method-modal";
import VoyageDetail from "./_components/voyage-detail";
// import { useGetTransactionsByBookingIdQuery } from "@/services/apis/bookings/transactions/transactions.service";
import { cn, formatCurrency } from "@/lib/utils";
import useAuth from "@/services/auth/use-auth";
import { objectToArray } from "@/services/helpers/objectUtils";
import { format, formatDate, isAfter, isBefore } from "date-fns";
import { SchedulesQueryParams } from "../../schedules/_types/route-search-params";
// import { CgExport } from "react-icons/cg";
import { PaymentMethodEnum } from "@/services/apis/bookings/transactions/types/transaction-type-enum";
import useAuthActions from "@/services/auth/use-auth-actions";
// import {
//   BookingUnknownErrors,
//   BookingValidationErrors,
//   OperatorOrderErrors,
// } from "@/services/apis/common/types/common-errors";
import UpdatePassengerDialog from "@/components/dialog/update-passenger-dialog";
import ModalTermsConditions from "@/components/modals/modal-terms-conditions/modal-terms-conditions";
import {
  TooltipResponsive,
  TooltipResponsiveContent,
  TooltipResponsiveTrigger,
} from "@/components/tooltip-responsive";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookingPaymentStatusEnum } from "@/services/apis/bookings/types/booking-payment-status-enum";
import {
  getIssueTicketSpeedLabel,
  IssueTicketSpeedEnum,
} from "@/services/apis/operators/enums/issue-ticket-speed.enum";
import { OrderStatusEnum } from "@/services/apis/orders/types/order-status-enum";
import { useOrganizationContext } from "@/services/apis/organizations/context/use-org-context";
import { UpdatePassengerInfoProps } from "@/services/apis/passengers/types/passenger";
import { RoleEnum } from "@/services/apis/users/types/role";
import { WordpressPage } from "@/services/infrastructure/wordpress/types/page";
import { NotFoundView } from "@/views/error";
import { CgExport } from "react-icons/cg";
import { MdInfoOutline } from "react-icons/md";
import {
  addPaymentFee,
  redirectToPaymentPage,
} from "../../payment-gateway/utils";
import BookingIdSkeleton from "./_components/booking-id-skeleton";

type TicketPriceExtend = {
  ticketPrice: TicketPrice;
  numb: number;
  totalPrice?: number;
};

type Summary = {
  departTickets?: TicketPriceExtend[];
  returnTickets?: TicketPriceExtend[];
};

type Props = {
  termsConditionPage?: WordpressPage;
};

const BookingInformation = ({ termsConditionPage }: Props) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { settings } = useOrganizationContext();
  const { refreshUser } = useAuthActions();
  const currentBalance = user?.customer.balance;
  const bookingId = useMemo(() => params.id as string, [params.id]);
  const { booking: bookingData, bookingLoading } = useGetBooking(
    bookingId,
    !!bookingId && !!user?.id
  );

  const router = useRouter();
  const { t } = useTranslation("booking");
  const { t: seatTranslation } = useTranslation("seat/seat");
  const [booking, setBooking] = useState<Booking>();

  const paidAmount = (() => {
    let amount = 0;
    const paidStatuses = [
      OrderStatusEnum.Booked,
      OrderStatusEnum.CancelRequest,
    ];

    if (
      paidStatuses.includes(
        booking?.depart_order?.order_status as OrderStatusEnum
      )
    ) {
      amount =
        amount +
        (booking?.depart_order?.total_price || 0) -
        (booking?.depart_order?.total_refund_amount ?? 0);
    }
    if (booking?.return_order) {
      if (
        paidStatuses.includes(
          booking?.return_order?.order_status as OrderStatusEnum
        )
      ) {
        amount +=
          (booking?.return_order?.total_price || 0) -
          (booking?.return_order?.total_refund_amount ?? 0);
      }
    }
    return amount;
  })();
  const remainingAmount = (booking?.total_price || 0) - paidAmount;

  // const bookingTotalPriceFinal = (() => {
  //   // Initialize depart order calculations
  //   //   let departPrice = booking?.total_price || 0;

  //   let bookingTotalPriceTemp = booking?.total_price || 0;
  //   const departIssueTicketSpeed =
  //     booking?.depart_order?.voyage?.operator?.configs?.issue_ticket_speed;
  //   const isDepartManual =
  //     departIssueTicketSpeed !== IssueTicketSpeedEnum.INSTANT;

  //   if (booking?.booking_status === BookingStatusEnum.Booked) {
  //     return bookingTotalPriceTemp;
  //   }

  //   // Check if both orders are in WaitForIssue or Booked status
  //   if (
  //     (booking?.depart_order?.order_status === OrderStatusEnum.WaitForIssue ||
  //       booking?.depart_order?.order_status === OrderStatusEnum.Booked) &&
  //     ((booking?.return_order &&
  //       booking?.return_order?.order_status === OrderStatusEnum.WaitForIssue) ||
  //       booking?.return_order?.order_status === OrderStatusEnum.Booked)
  //   ) {
  //     return bookingTotalPriceTemp;
  //   }

  //   // Check if depart order is in WaitForIssue status
  //   if (
  //     booking?.depart_order?.order_status === OrderStatusEnum.WaitForIssue &&
  //     !booking?.return_order
  //   ) {
  //     return bookingTotalPriceTemp;
  //   }

  //   // Handle depart order
  //   if (booking?.depart_order?.order_status) {
  //     if (
  //       isDepartManual &&
  //       booking.depart_order.order_status === OrderStatusEnum.WaitForIssue
  //     ) {
  //       bookingTotalPriceTemp =
  //         bookingTotalPriceTemp - booking?.depart_order?.total_price;
  //     } else if (booking.depart_order.order_status === OrderStatusEnum.Booked) {
  //       bookingTotalPriceTemp =
  //         bookingTotalPriceTemp - booking?.depart_order?.total_price;
  //     } else {
  //       bookingTotalPriceTemp = bookingTotalPriceTemp;
  //     }
  //   }

  //   // Initialize return order calculations
  //   if (booking?.return_order) {
  //     const returnIssueTicketSpeed =
  //       booking?.return_order?.voyage?.operator?.configs?.issue_ticket_speed;
  //     const isReturnManual =
  //       returnIssueTicketSpeed !== IssueTicketSpeedEnum.INSTANT;

  //     if (
  //       isReturnManual &&
  //       booking.return_order.order_status === OrderStatusEnum.WaitForIssue
  //     ) {
  //       bookingTotalPriceTemp =
  //         bookingTotalPriceTemp - booking?.return_order?.total_price;
  //     } else if (booking.return_order.order_status === OrderStatusEnum.Booked) {
  //       bookingTotalPriceTemp =
  //         bookingTotalPriceTemp - booking?.return_order?.total_price;
  //     }
  //   }

  //   // Calculate final price
  //   return bookingTotalPriceTemp;
  // })();

  const paymentMethodParam = searchParams.get("payment_method") ?? undefined;
  const agreedTerms = searchParams.get("agreedTerms") ?? undefined;

  const [paymentMethod, setPaymentMethod] = useState<string>(
    paymentMethodParam || PaymentMethodEnum.QRCode
  );
  const [departVoyage, setDepartVoyage] = useState<Voyage>();
  const [returnVoyage, setReturnVoyage] = useState<Voyage>();
  const [departBoatLayout, setDepartBoatLayout] = useState<BoatLayout>();
  const [returnBoatLayout, setReturnBoatLayout] = useState<BoatLayout>();
  const [departOrder, setDepartOrder] = useState<Order>();
  const [returnOrder, setReturnOrder] = useState<Order>();
  // const [transaction, setTransaction] = useState<Transaction>();
  const [isCheck, setIsCheck] = useState(
    agreedTerms ? agreedTerms.toString() === "true" : false
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenTermsConditionsModal, setIsOpenTermsConditionsModal] =
    useState(false);
  // const [isConfirmExportTicket, setIsConfirmExportTicket] = useState(false);
  // const [isOpenExportResult, setIsOpenExportResult] = useState(false);
  // const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const getVoyageService = useGetVoyageService();
  const fetchBoatLayoutFromDatabase =
    useGetBoatLayoutFromDatabaseOfVoyageService();
  const getVoyage = useCallback(
    async (voyageId: string, isReturn: boolean) => {
      const { data, status } = await getVoyageService({ id: voyageId });
      if (status === HTTP_CODES_ENUM.OK) {
        if (isReturn) {
          setReturnVoyage(data);
        } else {
          setDepartVoyage(data);
        }
      }
    },
    [getVoyageService]
  );

  // const { transactions, transactionsRefetch } =
  //   useGetTransactionsByBookingIdQuery(
  //     useMemo(() => ({ booking_id: bookingId }), [bookingId])
  //   );

  // useEffect(() => {
  //   if (transactions) {
  //     if (booking && booking?.booking_status !== BookingStatusEnum.Booked) {
  //       const trans =
  //         transactions.find(
  //           (transaction) => transaction.amount === booking.total_price
  //         ) ?? null;
  //       if (trans) setTransaction(trans);
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [booking?.payment_status, transactions]);

  useEffect(() => {
    setBooking(bookingData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData]);

  const getBoatLayout = useCallback(
    async (voyageId: string, isReturn: boolean) => {
      const { data, status } = await fetchBoatLayoutFromDatabase({
        voyageId: voyageId,
      });
      if (status === HTTP_CODES_ENUM.OK && data?.boatLayout) {
        if (isReturn) {
          setReturnBoatLayout(data.boatLayout);
        } else {
          setDepartBoatLayout(data.boatLayout);
        }
      }
    },
    [fetchBoatLayoutFromDatabase]
  );

  useEffect(() => {
    const departOrder = booking?.depart_order;
    if (departOrder) {
      getVoyage(departOrder.voyage_id, false);
      getBoatLayout(departOrder.voyage_id, false);
      setDepartOrder(departOrder);
    }
    const returnOrder = booking?.return_order;
    if (returnOrder) {
      getVoyage(returnOrder.voyage_id, true);
      getBoatLayout(returnOrder.voyage_id, true);
      setReturnOrder(returnOrder);
    }
    // const transaction = booking?.transactions ? booking?.transactions[0] : null;
    // if (transaction) {
    //   setTransaction(transaction.transaction);
    // }
    // transactionsRefetch();
  }, [booking, getBoatLayout, getVoyage]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleRedirectToPaymentPage = useCallback(() => {
    router.push(
      redirectToPaymentPage({
        paymentMethod: paymentMethod as PaymentMethodEnum,
        bookingId: bookingId,
        currentBalance: currentBalance as number,
        isCheck: isCheck,
        redirectBack: "booking",
        customerId: user?.customer_id,
        paymentAmount: bookingData?.total_price,
      })
    );
  }, [
    bookingData?.total_price,
    bookingId,
    currentBalance,
    isCheck,
    paymentMethod,
    router,
    user?.customer_id,
  ]);

  const handleRedirectToIssueTicketPage = useCallback(() => {
    const url = `/booking/${bookingId}/issue-ticket/?payment_method=${paymentMethod}&booking_id=${bookingId}&agreedTerms=${isCheck}`;

    router.push(url);
  }, [bookingId, isCheck, paymentMethod, router]);

  const isManual = useMemo(
    () =>
      booking?.depart_order?.voyage?.operator?.configs?.issue_ticket_speed !==
        IssueTicketSpeedEnum.INSTANT ||
      (booking?.return_order &&
        booking?.return_order?.voyage?.operator?.configs?.issue_ticket_speed !==
          IssueTicketSpeedEnum.INSTANT),
    [
      booking?.depart_order?.voyage?.operator?.configs?.issue_ticket_speed,
      booking?.return_order,
    ]
  );

  const issueTicketSpeedLabel = useMemo(() => {
    const issueTicketSpeed =
      departOrder?.voyage?.operator?.configs.issue_ticket_speed;
    if (issueTicketSpeed !== IssueTicketSpeedEnum.INSTANT) {
      return getIssueTicketSpeedLabel(issueTicketSpeed as IssueTicketSpeedEnum);
    }
    return getIssueTicketSpeedLabel(
      returnOrder?.voyage?.operator?.configs
        .issue_ticket_speed as IssueTicketSpeedEnum
    );
  }, [
    departOrder?.voyage?.operator?.configs.issue_ticket_speed,
    returnOrder?.voyage?.operator?.configs.issue_ticket_speed,
  ]);

  /**
   * downloadFile is a useCallback hook that downloads a file based on its URL.
   *
   * @param {string | null} url - The URL of the file to download.
   * @returns {void} - This function does not return a value.
   *
   * The useCallback hook ensures that the same function instance is returned as long as the `downloadFile` dependency does not change.
   */
  // const downloadFile = useCallback((url: string | null) => {
  //   if (url) {
  //     fetch(url)
  //       .then((response) => response.blob())
  //       .then((blod) => {
  //         const boldUrl = window.URL.createObjectURL(new Blob([blod]));
  //         const fileName = url.split("/").pop();
  //         const aTag = document.createElement("a");
  //         aTag.href = boldUrl;
  //         aTag.setAttribute("download", fileName as string);
  //         document.body.appendChild(aTag);
  //         aTag.click();
  //         aTag.remove();
  //       });
  //   }
  // }, []);

  // const handleDownloadDepartOrderFile = useCallback(() => {
  //   downloadFile(bookingData?.depart_order?.tickets_file?.path ?? "");
  // }, [bookingData?.depart_order?.tickets_file?.path, downloadFile]);

  // const handleDownloadReturnOrderFile = useCallback(() => {
  //   downloadFile(bookingData?.return_order?.tickets_file?.path ?? "");
  // }, [bookingData?.return_order?.tickets_file?.path, downloadFile]);

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
    if (booking?.depart_order?.voyage_id) {
      URL += `?departVoyageId=${booking?.depart_order?.voyage_id}`;
    }

    if (booking?.return_order?.voyage_id) {
      URL += `&returnVoyageId=${booking?.return_order?.voyage_id}`;
    }

    if (booking?.depart_order?.id) {
      URL += `&depart_order_id=${booking?.depart_order?.id}`;
    }

    if (booking?.return_order?.id) {
      URL += `&return_order_id=${booking?.return_order?.id}`;
    }

    URL += `&numberOfPassengers=${1}`;
    // Check if edit ticket
    URL += `&mode=edit`;
    // Booking ID
    URL += `&booking_id=${bookingId}`;

    router.push(URL);
  }, [booking, bookingId, router]);

  let ticketNumbColsDepart = 0;
  const departTickets: Ticket[] = useMemo(
    () => (departOrder ? departOrder.tickets : []),
    [departOrder]
  );
  const summary: Summary = {};

  if (departOrder) {
    ticketNumbColsDepart =
      departOrder.tickets.length / 2 <= 1
        ? 2
        : Math.ceil(departOrder.tickets.length / 2);
    const ticketTypeIds = new Set();
    departTickets.forEach((ticket) => {
      ticketTypeIds.add(ticket.ticket_type_id);
    });
    let prices: TicketPrice[] = [];
    if (departBoatLayout) {
      prices = departBoatLayout?.prices.filter((ticketPrice) =>
        ticketTypeIds.has(ticketPrice.ticket_type_id)
      );

      prices = prices.map<TicketPrice>((price) => ({
        ...price,
        price_with_VAT:
          departTickets.find(
            (ticket) =>
              ticket.ticket_type_id === price.ticket_type_id &&
              ticket.seat_type_code === price.seat_type
          )?.price ?? price.price_with_VAT,
      }));
    }

    let ticketPriceExtend: TicketPriceExtend[] = prices.map((price) => ({
      ticketPrice: price,
      numb: 0,
    }));
    departTickets.forEach((ticket) => {
      if (ticketTypeIds.size <= 1) {
        ticketPriceExtend = ticketPriceExtend.map((item) => {
          if (item.ticketPrice.seat_type === ticket.seat_type_code) {
            return { ticketPrice: item.ticketPrice, numb: item.numb + 1 };
          }
          return item;
        });
      } else {
        ticketPriceExtend = ticketPriceExtend.map((item) => {
          if (
            item.ticketPrice.seat_type === ticket.seat_type_code &&
            item.ticketPrice.ticket_type_id === ticket.ticket_type_id
          ) {
            return { ticketPrice: item.ticketPrice, numb: item.numb + 1 };
          }
          return item;
        });
      }
    });
    ticketPriceExtend = ticketPriceExtend.filter((item) => item.numb > 0);
    summary.departTickets = ticketPriceExtend.map((item) => {
      return {
        ...item,
        totalPrice: item.numb * item.ticketPrice.price_with_VAT,
      };
    });
  }

  let ticketNumbColsReturn = 0;
  const returnTickets: Ticket[] = useMemo(
    () => (returnOrder ? returnOrder.tickets : []),
    [returnOrder]
  );
  if (returnOrder) {
    ticketNumbColsReturn =
      returnOrder.tickets.length / 2 <= 1
        ? 2
        : Math.ceil(returnOrder.tickets.length / 2);
    const ticketTypeIds = new Set();
    returnTickets.forEach((ticket) => {
      ticketTypeIds.add(ticket.ticket_type_id);
    });
    let prices: TicketPrice[] = [];

    if (returnBoatLayout) {
      prices = returnBoatLayout.prices.filter((ticketPrice) =>
        ticketTypeIds.has(ticketPrice.ticket_type_id)
      );
      prices = prices.map<TicketPrice>((price) => ({
        ...price,
        price_with_VAT:
          returnTickets.find(
            (ticket) =>
              ticket.ticket_type_id === price.ticket_type_id &&
              ticket.seat_type_code === price.seat_type
          )?.price ?? price.price_with_VAT,
      }));
    }

    let ticketPriceExtend: TicketPriceExtend[] = prices.map((price) => ({
      ticketPrice: price,
      numb: 0,
    }));

    returnTickets.forEach((ticket) => {
      if (ticketTypeIds.size <= 1) {
        ticketPriceExtend = ticketPriceExtend.map((item) => {
          if (item.ticketPrice.seat_type === ticket.seat_type_code) {
            return { ticketPrice: item.ticketPrice, numb: item.numb + 1 };
          }
          return item;
        });
      } else {
        ticketPriceExtend = ticketPriceExtend.map((item) => {
          if (
            item.ticketPrice.seat_type === ticket.seat_type_code &&
            item.ticketPrice.ticket_type_id === ticket.ticket_type_id
          ) {
            return { ticketPrice: item.ticketPrice, numb: item.numb + 1 };
          }
          return item;
        });
      }
    });
    ticketPriceExtend = ticketPriceExtend.filter((item) => item.numb > 0);
    summary.returnTickets = ticketPriceExtend.map((item) => {
      return {
        ...item,
        totalPrice: item.numb * item.ticketPrice.price_with_VAT,
      };
    });
  }

  const isDisabledEdit = useMemo(() => {
    const now = new Date();
    const departDate = new Date(
      `${booking?.depart_order?.voyage?.departure_date}T${booking?.depart_order?.voyage?.depart_time}`
    );
    const returnDate = new Date(
      `${booking?.return_order?.voyage?.departure_date}T${booking?.return_order?.voyage?.depart_time}`
    );
    if (isAfter(now, departDate) || isAfter(now, returnDate)) {
      return true;
    }

    if (
      booking?.booking_status === BookingStatusEnum.Booked ||
      booking?.booking_status === BookingStatusEnum.CancelRequest ||
      booking?.booking_status === BookingStatusEnum.Cancelled ||
      booking?.booking_status ===
        BookingStatusEnum.CancelledBecauseBoatNotDepart
    ) {
      return true;
    }
    return false;
  }, [
    booking?.booking_status,
    booking?.depart_order?.voyage?.depart_time,
    booking?.depart_order?.voyage?.departure_date,
    booking?.return_order?.voyage?.depart_time,
    booking?.return_order?.voyage?.departure_date,
  ]);

  // Check enable payment (for expired booking, or voyage is before now)
  const isEnablePayment = useMemo(() => {
    const now = new Date();
    const departDate = new Date(
      `${booking?.depart_order?.voyage?.departure_date}T${booking?.depart_order?.voyage?.depart_time}`
    );
    const returnDate = new Date(
      `${booking?.return_order?.voyage?.departure_date}T${booking?.return_order?.voyage?.depart_time}`
    );

    if (booking?.booking_status === BookingStatusEnum.Requested) {
      return isBefore(now, departDate) || isBefore(now, returnDate);
    }

    if (booking?.booking_status === BookingStatusEnum.Expired) {
      return false;
    }

    return true;
  }, [
    booking?.booking_status,
    booking?.depart_order?.voyage?.depart_time,
    booking?.depart_order?.voyage?.departure_date,
    booking?.return_order?.voyage?.depart_time,
    booking?.return_order?.voyage?.departure_date,
  ]);

  const handleNavigateToSchedule = useCallback(() => {
    const queryParams: SchedulesQueryParams = {
      from: formatDate(
        booking?.depart_order.voyage?.departure_date as string,
        "yyyy-MM-dd"
      ),
      p: "1",
    };

    const params = [
      booking?.depart_order.voyage?.route?.id,
      booking?.depart_order.voyage?.route?.departure_abbreviation,
      booking?.depart_order.voyage?.route?.destination_abbreviation,
    ];

    const path = `/schedules/${params.join("-")}?${objectToArray(queryParams)
      .filter((item) => item.value)
      .map((item) => `${item.key}=${item.value}`)
      .join("&")}`;

    router.push(path);
  }, [
    booking?.depart_order.voyage?.departure_date,
    booking?.depart_order.voyage?.route?.departure_abbreviation,
    booking?.depart_order.voyage?.route?.destination_abbreviation,
    booking?.depart_order.voyage?.route?.id,
    router,
  ]);

  const [isEditPassengerModalOpen, setIsEditPassengerModalOpen] =
    useState(false);
  const [passengerToEdit, setPassengerToEdit] =
    useState<UpdatePassengerInfoProps | null>(null);
  const handleEditPassenger = useCallback(
    (passenger: UpdatePassengerInfoProps) => {
      setPassengerToEdit(passenger);
      setIsEditPassengerModalOpen(true);
    },
    []
  );

  const handleCloseEditPassengerModal = useCallback(() => {
    setIsEditPassengerModalOpen(false);
    setPassengerToEdit(null);
  }, []);

  // const renderErrorContent = (errorCode: number) => {
  //   switch (errorCode) {
  //     case OperatorOrderErrors.CreateOrderFailedDueToUnavailableSeats:
  //       return <>{t("export-ticket-modal.errorBookedSeatExport")}</>;
  //     case BookingUnknownErrors.Unknown:
  //       return <>{t("export-ticket-modal.errorUknown")}</>;
  //     case BookingValidationErrors.AlreadyProcessingIssueTicket:
  //       return <>{t("export-ticket-modal.errorProcessingIssueTicket")}</>;
  //     case BookingValidationErrors.CustomerBalanceNotEnough:
  //       return <>{t("export-ticket-modal.errorCustomerBalanceNotEnough")}</>;
  //     case BookingValidationErrors.InvalidInput:
  //       return <>{t("export-ticket-modal.errorInvalidInput")}</>;
  //     case BookingValidationErrors.InvalidStatus:
  //       return <>{t("export-ticket-modal.errorInvalidStatus")}</>;
  //     case BookingValidationErrors.NoCustomerAttached:
  //       return <>{t("export-ticket-modal.errorNoCustomerAttached")}</>;
  //     case BookingValidationErrors.OrganizationBalanceNotEnough:
  //       return (
  //         <>
  //           {t("export-ticket-modal.ticket_export_error", {
  //             errorCode: errorCode,
  //           })}
  //         </>
  //       );
  //     case OperatorOrderErrors.OperatorIsDisabled:
  //       return <>{t("export-ticket-modal.errorOperatorIsDisabled")}</>;
  //     default:
  //       return (
  //         <>
  //           {t("export-ticket-modal.ticket_export_error", {
  //             errorCode: errorCode,
  //           })}
  //         </>
  //       );
  //   }
  // };

  const isEnablePaymentButton = useMemo(() => {
    const checkBalance =
      user &&
      user.customer &&
      booking &&
      user.customer.balance >= remainingAmount;

    const checkTickCheckBox = !isCheck || !isEnablePayment;

    if (checkBalance) {
      return "!hidden";
    } else {
      if (checkTickCheckBox) {
        return "!cursor-default";
      } else {
        return "!cursor-pointer";
      }
    }
  }, [booking, remainingAmount, isCheck, isEnablePayment, user]);

  const isEnableExportButton = useMemo(() => {
    const checkBalance =
      user &&
      user.customer &&
      booking &&
      user.customer.balance < remainingAmount;

    const checkTickCheckBox = !isCheck || !isEnablePayment;

    if (checkBalance) {
      return "!hidden";
    } else {
      if (checkTickCheckBox) {
        return "!cursor-default";
      } else {
        return "!cursor-pointer";
      }
    }
  }, [booking, remainingAmount, isCheck, isEnablePayment, user]);

  const checkIsExpiredDepartVoyage = useMemo(() => {
    const now = new Date();
    const departDate = new Date(
      `${booking?.depart_order?.voyage?.departure_date}T${booking?.depart_order?.voyage?.depart_time}`
    );
    return isBefore(now, departDate);
  }, [
    booking?.depart_order?.voyage?.depart_time,
    booking?.depart_order?.voyage?.departure_date,
  ]);

  const checkIsExpiredReturnVoyage = useMemo(() => {
    const now = new Date();
    const departDate = new Date(
      `${booking?.return_order?.voyage?.departure_date}T${booking?.return_order?.voyage?.depart_time}`
    );
    return isBefore(now, departDate);
  }, [
    booking?.return_order?.voyage?.depart_time,
    booking?.return_order?.voyage?.departure_date,
  ]);

  const handleOpenTermsConditionsModal = useCallback(() => {
    setIsOpenTermsConditionsModal(true);
  }, []);
  const handleCloseTermsConditionsModal = useCallback(() => {
    setIsOpenTermsConditionsModal(false);
  }, []);
  const handleAgreeTerms = useCallback(() => {
    setIsOpenTermsConditionsModal(false);
    setIsCheck(true);
  }, []);
  const handleDisagreeTerms = useCallback(() => {
    setIsCheck(false);
  }, []);

  if (booking?.customer_id && user?.customer_id && user?.role) {
    if (
      !bookingLoading &&
      user?.customer_id !== booking?.customer_id &&
      user?.role.id === RoleEnum.USER
    ) {
      return (
        <NotFoundView
          messageTitle={t("error.not-found-booking")}
          messageDesription={t("error.not-found-booking-description")}
        />
      );
    }
  }

  return bookingLoading ? (
    <BookingIdSkeleton />
  ) : !bookingLoading && booking ? (
    <div className="lg:px-auto m-auto flex h-auto min-h-[calc(100vh_-_337px)] w-full max-w-screen-xl flex-col items-center justify-center gap-4 px-5 py-4 md:px-10">
      <div className="mb-4 flex w-full justify-center">
        <BookingStep
          currentStep={3}
          className="max-w-[500px]"
          onStepClick={handleClickEditIconButton}
          onStepClickStep1={handleNavigateToSchedule}
          isDisabledEdit={isDisabledEdit}
        />
      </div>
      <div className="flex w-full flex-col gap-4 lg:flex-row">
        <Tabs
          defaultValue="0"
          className="flex w-full flex-col items-center justify-center gap-4 lg:w-1/2"
        >
          <TabsList className="flex w-full flex-row bg-background text-foreground md:w-auto md:flex-none">
            <TabsTrigger
              value="0"
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t("voyage-tab.departure").toUpperCase()}
            </TabsTrigger>
            {booking?.return_order && (
              <TabsTrigger
                value="1"
                className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t("voyage-tab.return").toUpperCase()}
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent
            value="0"
            className="flex w-full flex-col gap-4 data-[state=inactive]:hidden"
          >
            <VoyageDetail
              voyage={departVoyage}
              boatLayout={departBoatLayout}
              order={departOrder}
              tickets={departTickets}
              ticketNumbCols={ticketNumbColsDepart}
              VATInvoice={booking.VAT_invoice}
              handleClickEditIconButton={handleClickEditIconButton}
              isDisabledEdit={isDisabledEdit}
              isCheckEditPassenger={
                (departOrder?.voyage?.operator?.features
                  ?.change_passenger_info &&
                  departOrder?.order_status === OrderStatusEnum.Booked &&
                  checkIsExpiredDepartVoyage) ||
                false
              }
              handleEditPassenger={handleEditPassenger}
            />
          </TabsContent>
          {returnOrder && (
            <TabsContent
              value="1"
              className="flex w-full flex-col gap-4 data-[state=inactive]:hidden"
            >
              <VoyageDetail
                voyage={returnVoyage}
                boatLayout={returnBoatLayout}
                order={returnOrder}
                tickets={returnTickets}
                ticketNumbCols={ticketNumbColsReturn}
                handleClickEditIconButton={handleClickEditIconButton}
                isDisabledEdit={isDisabledEdit}
                VATInvoice={booking.VAT_invoice}
                isCheckEditPassenger={
                  (returnOrder?.voyage?.operator?.features
                    ?.change_passenger_info &&
                    returnOrder?.order_status === OrderStatusEnum.Booked &&
                    checkIsExpiredReturnVoyage) ||
                  false
                }
                handleEditPassenger={handleEditPassenger}
              />
            </TabsContent>
          )}
        </Tabs>
        <div className="flex flex-col gap-4 lg:w-1/2">
          <div className="flex flex-col gap-2 rounded-md bg-white p-3 shadow-sm">
            <h2 className="text-sm font-bold">{t("payment-info.title")}</h2>
            <div className="w-full overflow-hidden overflow-x-scroll">
              <table className="w-full min-w-[880px] table-auto text-sm">
                <thead>
                  <tr>
                    <th className="h-9 bg-primary-100 pl-4 text-start font-bold"></th>
                    <th className="h-9 bg-primary-100 pl-4 text-start font-bold">
                      {t("payment-info.table.col.voyage")}
                    </th>
                    <th className="h-9 bg-primary-100 pl-4 text-start font-bold">
                      {t("payment-info.table.col.ticket-type")}
                    </th>
                    <th className="h-9 bg-primary-100 pl-4 text-start font-bold">
                      {t("payment-info.table.col.seat-type")}
                    </th>
                    <th className="h-9 bg-primary-100 pl-4 text-start font-bold">
                      {t("payment-info.table.col.amount")}
                    </th>
                    <th className="h-9 bg-primary-100 pl-4 text-start font-bold">
                      {t("payment-info.table.col.price")}
                    </th>
                    <th className="h-9 bg-primary-100 pl-4 text-start font-bold">
                      {t("payment-info.table.col.total")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.departTickets?.map((item, index) => (
                    <tr key={index}>
                      <td className="h-9 bg-primary-100 pl-4 text-start font-bold"></td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                        {t("payment-info.table.departure")}
                      </td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                        {`${item.ticketPrice.ticket_type_label}`}
                      </td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                        {seatTranslation(
                          "seatType." + item.ticketPrice.seat_type
                        )}
                      </td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                        {`${item.numb}`}
                      </td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                        {`${formatCurrency(item.ticketPrice.price_with_VAT)}`}
                      </td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                        <span className="rounded-sm bg-primary-200 p-1.5 font-bold">
                          {item.totalPrice
                            ? `${formatCurrency(item?.totalPrice)}`
                            : "0"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {summary?.returnTickets?.map((item, index) => (
                    <tr key={index}>
                      <td className="h-9 bg-primary-100 pl-4 text-start font-bold"></td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                        {t("payment-info.table.return")}
                      </td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                        {`${item.ticketPrice.ticket_type_label}`}
                      </td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                        {seatTranslation(
                          "seatType." + item.ticketPrice.seat_type
                        )}
                      </td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                        {`${item.numb}`}
                      </td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                        {`${formatCurrency(item.ticketPrice.price_with_VAT)}`}
                      </td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                        <span className="rounded-sm bg-primary-200 p-1.5 font-bold">
                          {item.totalPrice
                            ? `${formatCurrency(item?.totalPrice)}`
                            : "0"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td className="h-9 bg-primary-100 pl-4 text-start font-bold">
                      {t("payment-info.table.row.total-ticket")}
                    </td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                      <span className="rounded-sm bg-primary-200 p-1.5 font-bold">
                        {booking?.total_ticket_price
                          ? formatCurrency(booking?.total_ticket_price)
                          : "0"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="h-9 bg-primary-100 pl-4 text-start font-bold">
                      {t("payment-info.table.row.total-harbor-fee")}
                    </td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                      <span className="rounded-sm bg-primary-200 p-1.5 font-bold">
                        {booking?.total_harbor_fee
                          ? formatCurrency(booking?.total_harbor_fee)
                          : "0"}
                      </span>
                    </td>
                  </tr>
                  {booking?.total_discount && booking?.total_discount > 0 ? (
                    <tr>
                      <td className="h-9 bg-primary-100 pl-4 text-start font-bold text-success-500">
                        {t("payment-info.table.row.discount")}
                      </td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                      <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                        <span className="rounded-sm bg-success-100 p-1.5 font-bold">
                          {`-${formatCurrency(booking?.total_discount)}`}
                        </span>
                      </td>
                    </tr>
                  ) : null}
                  <tr>
                    <td className="h-9 bg-primary-100 pl-4 text-start font-bold">
                      {t("payment-info.table.row.total")}
                    </td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start"></td>
                    <td className="h-9 border-b-2 border-dashed border-default-100 pl-4 text-start">
                      <span className="rounded-sm bg-primary-200 p-1.5 font-bold">
                        {booking?.total_price
                          ? formatCurrency(booking?.total_price)
                          : "0"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            className={cn(
              "flex w-full flex-col gap-3 rounded-md bg-white p-3 shadow-sm",
              user &&
                user.customer &&
                booking &&
                user.customer.balance >= remainingAmount
                ? "hidden"
                : ""
            )}
          >
            <h2 className="text-sm font-bold">{t("payment-methods.title")}</h2>
            <RadioGroup
              name="payment-method"
              className="flex flex-col gap-2 text-sm"
              value={paymentMethod}
              onValueChange={setPaymentMethod}
            >
              <Radio value="0">
                {t("payment-methods.qr")}{" "}
                <span className="font-semibold">
                  {t("payment-methods.fee", {
                    fee: "0đ",
                  })}
                </span>
              </Radio>
              <Radio value="1">
                {t("payment-methods.banking")}{" "}
                <span className="font-semibold">
                  {t("payment-methods.fee", {
                    fee: "0đ",
                  })}
                </span>
              </Radio>
              <Radio value="2">
                {t("payment-methods.direct")}
                <span className="font-semibold">
                  {t("payment-methods.fee", {
                    fee: "0đ",
                  })}
                </span>
              </Radio>
              {settings?.payment?.OnePaySettings?.is_enable && (
                <Radio value="3">
                  {t("payment-methods.onepay")}
                  {settings?.payment?.OnePaySettings
                    ?.is_enable_transaction_fee ? (
                    <span className="font-semibold">
                      {t("payment-methods.fee", {
                        fee: `${settings?.payment?.OnePaySettings?.fixedFeePerTransaction}đ + ${settings?.payment?.OnePaySettings?.feePerPercentageOfPaymentAmount}%`,
                      })}
                    </span>
                  ) : (
                    <span className="font-semibold">
                      {t("payment-methods.fee", {
                        fee: `0đ`,
                      })}
                    </span>
                  )}
                </Radio>
              )}
            </RadioGroup>
            <h3 className="text-sm font-bold">
              {t("payment-methods.remaining")}
              {paymentMethod === "3" ? (
                <span className="text-danger">{`${formatCurrency(
                  remainingAmount +
                    addPaymentFee(
                      booking?.total_price,
                      settings?.payment?.OnePaySettings
                        ?.fixedFeePerTransaction || 0,
                      settings?.payment?.OnePaySettings
                        ?.feePerPercentageOfPaymentAmount || 0
                    )
                )}`}</span>
              ) : (
                <span className="text-danger">{`${formatCurrency(
                  remainingAmount
                )}`}</span>
              )}
            </h3>

            <h3 className="text-sm font-bold">
              {t("payment-methods.paid")}
              <span className="text-danger">{`${formatCurrency(
                paidAmount
              )}`}</span>
            </h3>
            <p className="text-sm text-danger-600">
              {t("payment-methods.note")}
            </p>

            {isManual && (
              <p className="text-sm text-danger-600">
                <strong>Lưu ý:</strong> Trong đơn hàng có chuyến tàu{" "}
                <strong>{issueTicketSpeedLabel.title}</strong>{" "}
                {issueTicketSpeedLabel.subTitle}. Sau khi hệ thống xuất vé thành
                công, bạn sẽ nhận <strong>được vé qua email</strong>.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-1">
              <Checkbox
                radius="sm"
                isSelected={isCheck}
                onChange={handleOpenTermsConditionsModal}
              >
                <span className="text-sm font-bold text-black">
                  {t("payment-methods.terms-1")}
                </span>
              </Checkbox>
              <Button
                variant={"link"}
                onClick={handleOpenTermsConditionsModal}
                className="p-0 text-sm font-bold text-primary"
              >
                {t("payment-methods.terms-2")}
              </Button>
            </div>

            {!isEnablePayment && (
              <p className="text-sm text-danger-500">
                Bạn không thể thanh toán hay xuất vé do chuyến tàu đã khởi hành
              </p>
            )}
            {/* {isCheck && user && user.customer && booking && (
                <p
                  className={cn(
                    "text-sm",
                    user.customer.balance < booking.total_price
                      ? "text-danger-500"
                      : "text-success"
                  )}
                >
                  {t("payment-methods.check-balance.title")}
                  {user.customer.balance.toLocaleString("en-US")} VND -{" "}
                  {user.customer.balance < booking.total_price
                    ? t("payment-methods.check-balance.title-not-enough")
                    : t("payment-methods.check-balance.title-enough")}
                </p>
              )} */}
            <div className="flex gap-3">
              <Tooltip>
                <TooltipTrigger className={isEnablePaymentButton}>
                  <Button
                    id="btn-payment"
                    type="submit"
                    disabled={!isCheck || !isEnablePayment}
                    className={cn(
                      "w-fit !flex-none rounded-md px-6 py-2",
                      user &&
                        user.customer &&
                        booking &&
                        user?.customer?.balance < remainingAmount
                        ? ""
                        : "hidden"
                    )}
                    onClick={handleRedirectToPaymentPage}
                  >
                    {t("payment-methods.action-button")}
                  </Button>
                </TooltipTrigger>
                {!isEnablePayment && (
                  <TooltipContent>
                    <p>Chuyến tàu đã khởi hành</p>
                  </TooltipContent>
                )}
              </Tooltip>

              <Tooltip>
                <TooltipTrigger className={isEnableExportButton}>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!isCheck || !isEnablePayment}
                    className={cn(
                      "w-fit !flex-none rounded-md px-6 py-2",
                      user &&
                        user.customer &&
                        booking &&
                        user.customer.balance < remainingAmount
                        ? "hidden"
                        : ""
                    )}
                    onClick={handleRedirectToIssueTicketPage}
                  >
                    <CgExport className="mr-2 h-4 w-4" />
                    {t("export-ticket")}
                  </Button>
                </TooltipTrigger>
                {!isEnablePayment && (
                  <TooltipContent>
                    <p>Chuyến tàu đã khởi hành</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>

          <div
            className={cn(
              "flex w-full flex-col gap-3 rounded-md bg-white p-3 shadow-sm",
              user &&
                user.customer &&
                booking &&
                user.customer.balance < remainingAmount
                ? "hidden"
                : ""
            )}
          >
            <h3 className="text-sm font-bold">
              {t("payment-methods.available")}
              <span className="text-danger">{`${formatCurrency(user?.customer?.balance || 0)}`}</span>
            </h3>
            <h3 className="text-sm font-bold">
              {t("payment-methods.remaining")}
              <span className="text-danger">{`${formatCurrency(
                remainingAmount || 0
              )}`}</span>
            </h3>
            <h3 className="text-sm font-bold">
              {t("payment-methods.paid")}
              <span className="text-danger">{`${formatCurrency(
                paidAmount || 0
              )}`}</span>
            </h3>
            {booking.payment_status === BookingPaymentStatusEnum.NotPaid &&
              booking.booking_status === BookingStatusEnum.Requested &&
              booking.payment_expired_at && (
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-bold">
                    {t("payment-info.payment-due-date")}:
                  </h3>
                  <span className="text-sm">
                    {format(booking.payment_expired_at, "HH:mm dd/MM/yyyy")}
                  </span>
                  <TooltipResponsive>
                    <TooltipResponsiveTrigger asChild>
                      <div className="ml-2 flex h-fit w-fit max-w-[90vw] items-center justify-center rounded-md bg-warning-200 p-1 text-xs font-normal text-warning-700">
                        <MdInfoOutline />
                      </div>
                    </TooltipResponsiveTrigger>
                    <TooltipResponsiveContent className="flex items-center justify-center">
                      <span className="text-sm">
                        {t("payment-info.payment-due-date-tooltip")}
                      </span>
                    </TooltipResponsiveContent>
                  </TooltipResponsive>
                </div>
              )}
            <p className="text-sm text-danger-600">
              {t("payment-methods.note")}
            </p>

            {isManual && (
              <p className="text-sm text-danger-600">
                <strong>Lưu ý:</strong> Trong đơn hàng có chuyến tàu{" "}
                <strong>{issueTicketSpeedLabel.title}</strong>{" "}
                {issueTicketSpeedLabel.subTitle}. Sau khi hệ thống xuất vé thành
                công, bạn sẽ nhận <strong>được vé qua email</strong>.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-1">
              <Checkbox
                radius="sm"
                isSelected={isCheck}
                onChange={handleOpenTermsConditionsModal}
              >
                <span className="text-sm font-bold text-black">
                  {t("payment-methods.terms-1")}
                </span>
              </Checkbox>
              <Button
                variant={"link"}
                onClick={handleOpenTermsConditionsModal}
                className="p-0 text-sm font-bold text-primary"
              >
                {t("payment-methods.terms-2")}
              </Button>
            </div>

            {!isEnablePayment && (
              <p className="text-sm text-danger-500">
                Bạn không thể thanh toán hay xuất vé do chuyến tàu đã khởi hành
              </p>
            )}
            <div className="flex items-center justify-start gap-3">
              <Tooltip>
                <TooltipTrigger className={isEnableExportButton}>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!isCheck || !isEnablePayment}
                    className={cn(
                      "w-fit !flex-none rounded-md px-6 py-2",
                      user &&
                        user.customer &&
                        booking &&
                        user.customer.balance < remainingAmount
                        ? "hidden"
                        : ""
                    )}
                    onClick={handleRedirectToIssueTicketPage}
                  >
                    <CgExport className="mr-2 h-4 w-4" />
                    {t("export-ticket")}
                  </Button>
                </TooltipTrigger>
                {!isEnablePayment && (
                  <TooltipContent>
                    <p>Chuyến tàu đã khởi hành</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>

          {/* Section hiển thị lỗi từng order */}
          {/* {bookingData?.depart_order?.issue_ticket_error ||
          bookingData?.depart_order?.tickets_file ||
          bookingData?.return_order?.tickets_file ? (
            <div className="flex w-full flex-col gap-3 rounded-md bg-white p-3 shadow-sm">
              <div className="flex items-center gap-1">
                <h2 className="flex-none text-sm font-bold">
                  Tải vé chiều đi:
                </h2>
                <div className="flex items-center">
                  {bookingData?.depart_order?.issue_ticket_error &&
                  bookingData?.depart_order?.order_status !==
                    OrderStatusEnum.Booked ? (
                    <>
                      Lỗi xuất vé -{" "}
                      {renderErrorContent(
                        JSON.parse(
                          bookingData?.depart_order
                            ?.issue_ticket_error as string
                        )?.errorCode
                      )}
                    </>
                  ) : bookingData.depart_order.tickets_file?.path ? (
                    <Button
                      type="submit"
                      className="h-auto gap-1 rounded-md bg-primary p-1 font-normal hover:bg-primary/50"
                      onClick={handleDownloadDepartOrderFile}
                    >
                      <MdDownloading className="h-5 w-5" />
                    </Button>
                  ) : (
                    <>Chưa xuất vé</>
                  )}
                </div>
              </div>
              {bookingData?.return_order && (
                <div className="flex items-center gap-1">
                  <h2 className="flex-none text-sm font-bold">
                    Tải vé chiều về:
                  </h2>
                  <div className="flex items-center gap-1">
                    {bookingData?.return_order?.issue_ticket_error &&
                    bookingData?.return_order?.order_status !==
                      OrderStatusEnum.Booked ? (
                      <>
                        Lỗi xuất vé -
                        {renderErrorContent(
                          JSON.parse(
                            bookingData?.return_order
                              ?.issue_ticket_error as string
                          )?.errorCode
                        )}
                      </>
                    ) : bookingData?.depart_order?.issue_ticket_error &&
                      bookingData?.depart_order?.order_status !==
                        OrderStatusEnum.Booked &&
                      JSON.parse(
                        bookingData?.depart_order?.issue_ticket_error as string
                      )?.errorCode !==
                        OperatorOrderErrors.CreateOrderFailedDueToUnavailableSeats ? (
                      renderErrorContent(
                        JSON.parse(
                          bookingData?.depart_order
                            ?.issue_ticket_error as string
                        )?.errorCode
                      )
                    ) : bookingData.return_order.tickets_file?.path ? (
                      <Button
                        type="submit"
                        className="h-auto gap-1 rounded-md bg-primary p-1 font-normal hover:bg-primary/50"
                        onClick={handleDownloadReturnOrderFile}
                      >
                        <MdDownloading className="h-5 w-5" />
                      </Button>
                    ) : (
                      <>Chưa xuất vé</>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null} */}

          {/* <ResultExportTicketModal
              isOpenExportResult={isOpenExportResult}
              setIsOpenExportResult={setIsOpenExportResult}
              setIsConfirm={setIsConfirmExportTicket}
              departOrder={departOrder}
              returnOrder={returnOrder}
            /> */}

          <PaymentMethodModal
            booking={booking}
            isOpen={isOpen}
            paymentMethod={paymentMethod}
            setIsOpen={setIsOpen}
          />
          <UpdatePassengerDialog
            requestOrderInfo={passengerToEdit}
            isOpen={isEditPassengerModalOpen}
            onClose={handleCloseEditPassengerModal}
          />
          {/* <PaymentModal
              booking={booking}
              departOrder={departOrder}
              isPaymentOpen={isPaymentOpen}
              transaction={transaction}
              returnOrder={returnOrder}
              setIsPaymentOpen={setIsPaymentOpen}
            /> */}
          <ModalTermsConditions
            isOpen={isOpenTermsConditionsModal}
            termsConditionsContent={termsConditionPage?.content ?? ""}
            termsConditionsUrl={termsConditionPage?.uri ?? "#"}
            onClose={handleCloseTermsConditionsModal}
            isTermAgree={isCheck}
            onAgree={handleAgreeTerms}
            onDisagree={handleDisagreeTerms}
          />
        </div>
      </div>
    </div>
  ) : (
    <NotFoundView
      messageTitle={t("error.not-found-booking")}
      messageDesription={t("error.not-found-booking-description")}
    />
  );
};

export default memo(withPageRequiredAuth(BookingInformation));
