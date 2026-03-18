"use client";

import PaymentMethodModal from "@/app/(language)/booking/[id]/_components/_modal/payment-method-modal";
import ButtonExportPassenger from "@/app/(language)/booking/[id]/_components/button-export-passenger";
import {
  addPaymentFee,
  redirectToPaymentPage,
} from "@/app/(language)/payment-gateway/utils";
import ChipBookingStatus from "@/components/chip/chip-booking-status";
import ChipPaymentStatus from "@/components/chip/chip-payment-status";
import ModalTermsConditions from "@/components/modals/modal-terms-conditions/modal-terms-conditions";
import ModalTransactionHistoryOrder from "@/components/modals/modal-transaction-list/modal-transaction-list";
import {
  TooltipResponsive,
  TooltipResponsiveContent,
  TooltipResponsiveTrigger,
} from "@/components/tooltip-responsive";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";
import { useGetBooking } from "@/services/apis/bookings/bookings.service";
import { PaymentMethodEnum } from "@/services/apis/bookings/transactions/types/transaction-type-enum";
import { BookingPaymentStatusEnum } from "@/services/apis/bookings/types/booking-payment-status-enum";
import { BookingStatusEnum } from "@/services/apis/bookings/types/booking-status-enum";
import {
  getIssueTicketSpeedLabel,
  IssueTicketSpeedEnum,
} from "@/services/apis/operators/enums/issue-ticket-speed.enum";
import { OrderStatusEnum } from "@/services/apis/orders/types/order-status-enum";
import { useOrganizationContext } from "@/services/apis/organizations/context/use-org-context";
import { RoleEnum } from "@/services/apis/users/types/role";
import useAuth from "@/services/auth/use-auth";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import useLanguage from "@/services/i18n/use-language";
import { WordpressPage } from "@/services/infrastructure/wordpress/types/page";
import { NotFoundView } from "@/views/error";
import {
  Checkbox,
  cn,
  Radio,
  RadioGroup,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { format, isAfter, isBefore } from "date-fns";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { CgExport } from "react-icons/cg";
import {
  MdArrowBack,
  MdInfoOutline,
  MdOutlineOpenInFull,
} from "react-icons/md";
import OrderInfoCard from "./card/order-detail-card";
import PaymentModal from "./modal/payment-modal";
import OrderDetailModal from "./sections/order-detail-section";

type Props = {
  termsConditionPage?: WordpressPage;
};
const UserBookingDetail = ({ termsConditionPage }: Props) => {
  const params = useParams();
  const router = useRouter();
  const language = useLanguage();
  const { user } = useAuth();
  const { settings } = useOrganizationContext();
  const bookingId = useMemo(() => params.id as string, [params.id]);

  const searchParams = useSearchParams();
  const currentBalance = user?.customer.balance;

  const paymentMethodParam = searchParams.get("payment_method") ?? undefined;
  const agreedTerms = searchParams.get("agreedTerms") ?? undefined;

  const [intervalFunction, setIntervalFunction] = useState<NodeJS.Timeout>();
  const { booking, bookingLoading } = useGetBooking(
    bookingId,
    !!bookingId && !!user?.id
  );
  // const [isOpenModalTransaction, setIsOpenModalTransaction] =
  //   useState<boolean>(false);
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
  const remainingAmount = booking?.total_price - paidAmount;

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

  const {
    isOpen: isOpenModalTransaction,
    onOpen: setIsOpenModalTransaction,
    onOpenChange,
  } = useDisclosure();
  const [isOpenPayment, setIsOpenPayment] = useState(false);

  const [isCheck, setIsCheck] = useState(
    agreedTerms ? agreedTerms.toString() === "true" : false
  );

  const { t } = useTranslation("user/booking-detail");
  const { t: tPayment } = useTranslation("booking");

  const [isOpen, setIsOpen] = useState(false);

  const handleOpenPaymentModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [isOpenTermsConditionsModal, setIsOpenTermsConditionsModal] =
    useState(false);

  // const { transactions, transactionsRefetch } =
  //   useGetTransactionsByBookingIdQuery(
  //     useMemo(
  //       () => ({
  //         booking_id: bookingId,
  //         owner_types: [TransactionOwnerTypeEnum.Customer],
  //       }),
  //       [bookingId]
  //     )
  //   );

  // useEffect(() => {
  //   if (agreedTerms) {
  //     transactionsRefetch();
  //   }
  // }, [agreedTerms, transactionsRefetch]);

  const VAT_invoice = useMemo(() => booking?.VAT_invoice, [booking]);
  const hasVATInvoice: boolean = useMemo(
    () =>
      VAT_invoice?.VAT_company_address !== "" &&
      VAT_invoice?.VAT_company_name !== "" &&
      VAT_invoice?.VAT_email !== "" &&
      VAT_invoice?.VAT_tax_number !== "",
    [VAT_invoice]
  );

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
      booking?.depart_order?.voyage?.operator?.configs?.issue_ticket_speed;
    if (issueTicketSpeed !== IssueTicketSpeedEnum.INSTANT) {
      return getIssueTicketSpeedLabel(issueTicketSpeed as IssueTicketSpeedEnum);
    }
    return getIssueTicketSpeedLabel(
      booking.return_order?.voyage?.operator?.configs
        .issue_ticket_speed as IssueTicketSpeedEnum
    );
  }, [
    booking?.depart_order?.voyage?.operator?.configs?.issue_ticket_speed,
    booking?.return_order?.voyage?.operator?.configs?.issue_ticket_speed,
  ]);

  const handleReturn = useCallback(() => {
    router.push(`/${language}/user/bookings`);
  }, [language, router]);

  const downloadFile = useCallback((url: string | null) => {
    if (url) {
      fetch(url)
        .then((response) => response.blob())
        .then((blod) => {
          const boldUrl = window.URL.createObjectURL(new Blob([blod]));
          const fileName = url.split("/").pop();
          const aTag = document.createElement("a");
          aTag.href = boldUrl;
          aTag.setAttribute("download", fileName as string);
          document.body.appendChild(aTag);
          aTag.click();
          aTag.remove();
        });
    }
  }, []);

  const handleOpenModalTransaction = useCallback(() => {
    setIsOpenModalTransaction();
  }, [setIsOpenModalTransaction]);

  // const handleTransactionHistoryOrder = useCallback(() => {
  //   setIsOpenModalTransaction(false);
  // }, []);

  const handleDownloadFile = useCallback(
    (isDepart: boolean) => {
      if (isDepart) {
        downloadFile(booking.depart_order?.tickets_file?.path ?? "");
      } else {
        downloadFile(booking.return_order?.tickets_file?.path ?? "");
      }
    },
    [booking, downloadFile]
  );

  const handleDownloadDepartFileCallback = useCallback(
    () => handleDownloadFile(true),
    [handleDownloadFile]
  );

  const handleDownloadReturnFileCallback = useCallback(
    () => handleDownloadFile(false),
    [handleDownloadFile]
  );

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

  const [paymentMethod, setPaymentMethod] = useState<string>(
    paymentMethodParam || PaymentMethodEnum.QRCode
  );

  const handleRedirectToPaymentPage = useCallback(() => {
    router.push(
      redirectToPaymentPage({
        paymentMethod: paymentMethod as PaymentMethodEnum,
        bookingId: bookingId,
        currentBalance: currentBalance as number,
        isCheck: isCheck,
        customerId: user?.customer_id,
        paymentAmount: booking?.total_price,
      })
    );
  }, [
    bookingId,
    currentBalance,
    isCheck,
    paymentMethod,
    router,
    user?.customer_id,
    booking?.total_price,
  ]);

  const handleRedirectToIssueTicketPage = useCallback(() => {
    const url = `/booking/${bookingId}/issue-ticket/?payment_method=${paymentMethod}&booking_id=${bookingId}&agreedTerms=${isCheck}`;

    router.push(url);
  }, [bookingId, isCheck, paymentMethod, router]);

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
  }, [booking, isCheck, isEnablePayment, remainingAmount, user]);

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

  const scrollToPaymentSection = useCallback(() => {
    if (user) {
      if (user.customer.balance < remainingAmount) {
        const paymentSection = document.getElementById("paymentSection");
        if (paymentSection) {
          paymentSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      } else {
        const exportSection = document.getElementById("exportSection");
        if (exportSection) {
          exportSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    }
  }, [remainingAmount, user]);

  useEffect(() => {
    // fetch order on load
    if (booking) {
      setIsPaid(
        booking.payment_status === BookingPaymentStatusEnum.Paid ||
          booking.payment_status === BookingPaymentStatusEnum.Refunded
      );
      if (booking?.booking_status !== BookingStatusEnum.Requested) {
        setIsOpenPayment(false);
      }
    }
  }, [bookingId, booking]);

  // handle clear interval to avoid memory leak
  useEffect(() => {
    if (!isOpenPayment) {
      clearInterval(intervalFunction);
      setIntervalFunction(undefined);
    } else if (isPaid) {
      clearInterval(intervalFunction);
      setIntervalFunction(undefined);
      setIsOpenPayment(false);
    }

    return () => {
      clearInterval(intervalFunction);
    };
  }, [intervalFunction, isOpenPayment, isPaid]);

  if (booking?.customer_id && user?.customer_id && user?.role) {
    if (
      !bookingLoading &&
      user?.customer_id !== booking?.customer_id &&
      user?.role.id === RoleEnum.USER
    ) {
      return (
        <NotFoundView
          messageTitle={tPayment("error.not-found-booking")}
          messageDesription={tPayment("error.not-found-booking-description")}
        />
      );
    }
  }

  return bookingLoading ? (
    <AlertDialog defaultOpen>
      <AlertDialogContent className="w-fit">
        <AlertDialogTitle className="hidden">Loading</AlertDialogTitle>
        <AlertDialogHeader>
          <AlertDialogDescription asChild>
            <div className="flex h-full w-full items-center justify-center gap-2 p-3">
              <Spinner />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  ) : !booking ? (
    // Hiển thị loading khi chưa có dữ liệu
    <NotFoundView
      messageTitle={tPayment("error.not-found-booking")}
      messageDesription={tPayment("error.not-found-booking-description")}
    /> // Hiển thị view not-found nếu không có dữ liệu
  ) : (
    // Hiển thị chi tiết đặt chỗ khi có dữ liệu
    <div className="lg:px-auto m-auto flex h-auto w-full max-w-screen-xl flex-col items-center justify-center gap-4 px-5 py-2 pb-4 md:px-10 md:py-4">
      <PaymentMethodModal
        booking={booking}
        isOpen={isOpenPayment}
        paymentMethod={paymentMethod}
        setIsOpen={setIsOpenPayment}
      />
      <div className="relative flex w-full items-center justify-between gap-3 rounded-lg bg-background px-2 py-4 shadow-md">
        <Button
          type="submit"
          className="absolute gap-1 rounded-md bg-info px-2 py-2 hover:bg-info/50 md:px-6"
          onClick={handleReturn}
        >
          <MdArrowBack className="h-5 w-5" />
          <span className="md:block">{t("button.return")}</span>
        </Button>
        <p className="ml-auto flex w-full max-w-[80%] flex-col items-center justify-center gap-1 text-right text-sm font-semibold md:ml-0 md:max-w-full md:flex-row md:text-center">
          <span>
            {t("order")}: {booking.id}
          </span>
          <ChipBookingStatus status={booking.booking_status} />
        </p>
        <div className=""></div>
      </div>
      <div className="grid w-full grid-cols-12 flex-col gap-2">
        {/* Customer info */}
        <div
          className={cn(
            "col-span-12 flex flex-col gap-2 lg:col-span-4",
            !hasVATInvoice && "grid grid-cols-12 md:col-span-4 lg:col-span-4"
          )}
        >
          <div
            className={cn(
              "col-span-12 flex h-full w-full flex-col gap-3 rounded-lg bg-background p-3 shadow-md md:col-span-6 lg:col-span-5",
              !hasVATInvoice && "md:col-span-12 lg:col-span-12"
            )}
          >
            <p className="font-semibold">{t("customer-info")}</p>
            <p className="truncate text-sm">
              Tên: <span className="text-primary">{booking?.orderer_name}</span>
            </p>
            <p className="truncate text-sm">
              SĐT:{" "}
              <a
                className="w-fit text-primary hover:underline"
                href={`tel:${booking?.phone_number}`}
                target="_blank"
              >
                {booking?.phone_number}
              </a>
            </p>
            <p className="truncate text-sm">
              Email:{" "}
              <a
                className="w-fit text-primary hover:underline"
                href={`mailto:${booking?.contact_email}`}
                target="_blank"
              >
                {booking?.contact_email}
              </a>
            </p>
            {booking?.orderer_social_id && (
              <p className="truncate text-sm">
                CCCD:{" "}
                <span className="text-primary">
                  {booking?.orderer_social_id}
                </span>
              </p>
            )}
          </div>

          {hasVATInvoice && (
            <div
              className={cn(
                "col-span-12 flex h-full w-full flex-col gap-2 rounded-lg bg-background p-3 shadow-md md:col-span-6 lg:col-span-7"
              )}
            >
              <div className="flex flex-row gap-1">
                <p className="font-semibold">Thông tin hoá đơn</p>
                {/* {VAT_invoice?.VAT_file ? (
                  <div className="flex h-fit w-fit items-center justify-center rounded-md bg-primary-300 px-2 py-1 text-xs font-bold text-primary-foreground">
                    Đã xuất
                  </div>
                ) : (
                  <div className="flex h-fit w-fit items-center justify-center rounded-md bg-warning-400 px-2 py-1 text-xs font-bold">
                    Chưa xuất
                  </div>
                )} */}
              </div>
              <p>
                <span className="font-semibold">MST: </span>
                {`${VAT_invoice?.VAT_tax_number}`}
              </p>
              <p>
                <span className="font-semibold">Tên CT: </span>
                {`${VAT_invoice?.VAT_company_name}`}
              </p>
              <p>
                <span className="font-semibold">Địa chỉ: </span>
                {`${VAT_invoice?.VAT_company_address}`}
              </p>
              <p>
                <span className="font-semibold">Email nhận VAT: </span>
                {`${VAT_invoice?.VAT_email}`}
              </p>
            </div>
          )}
        </div>
        <div
          className={cn(
            "col-span-12 flex w-full flex-col gap-2 rounded-lg bg-background p-3 shadow-md md:flex-row lg:col-span-8",
            !hasVATInvoice && "md:col-span-7 lg:col-span-8"
          )}
        >
          <div className="flex w-full flex-col gap-3 md:w-1/2">
            <div className="flex w-full flex-wrap items-center">
              <p className="flex-none font-semibold">
                {t("payment-info.title")}
              </p>{" "}
              <div className="flex flex-none flex-col">
                <ChipPaymentStatus
                  className="flex w-fit flex-wrap items-center justify-center p-1"
                  status={booking.payment_status}
                />
                {/* {renderBookingStatus()} */}
              </div>
              {isPaid && (
                <>
                  <Button
                    type="submit"
                    className="h-auto gap-1 rounded-sm bg-info-100/30 p-1 text-info-600 hover:bg-info-100/20 hover:text-info-600/50"
                    onClick={handleOpenModalTransaction}
                  >
                    <MdOutlineOpenInFull className="h-5 w-5" />
                  </Button>
                  <ModalTransactionHistoryOrder
                    isOpen={isOpenModalTransaction}
                    onPrimaryPress={onOpenChange}
                    bookingId={bookingId}
                  ></ModalTransactionHistoryOrder>
                </>
              )}
            </div>
            <p>
              <span className="font-semibold">{`Tổng tiền vé: `}</span>
              {`${formatCurrency(booking.total_ticket_price)}`}
            </p>
            <p>
              <span className="font-semibold">{`Tổng phí cảng: `}</span>
              {`${formatCurrency(booking.total_harbor_fee)}`}
            </p>
            {booking?.total_discount && booking?.total_discount > 0 ? (
              <p className="text-success-500">
                <span className="font-semibold">{`Giảm giá: `}</span>
                {`-${formatCurrency(booking?.total_discount)}`}
              </p>
            ) : null}
            <p className="font-semibold">
              {`Thành tiền: `}
              <span className="font-semibold text-primary-500">{`${formatCurrency(booking?.total_price)}`}</span>
            </p>
            <p className="font-semibold">
              {`Số tiền đã thanh toán: `}
              <span className="font-semibold text-primary-500">{`${formatCurrency(paidAmount)}`}</span>
            </p>
          </div>
          {!isPaid &&
            booking.booking_status !== BookingStatusEnum.Cancelled && (
              <div
                className={cn(
                  "flex w-full flex-col items-start gap-3 rounded-lg border-1 border-dashed border-default p-2 md:w-1/2",
                  user &&
                    user.customer &&
                    booking &&
                    user.customer.balance >= remainingAmount
                    ? "hidden"
                    : ""
                )}
                id="paymentSection"
              >
                <h2 className="text-sm font-bold">
                  {tPayment("payment-methods.title")}
                </h2>
                <RadioGroup
                  name="payment-method"
                  className="flex flex-col gap-2 text-sm"
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <Radio value="0">
                    {tPayment("payment-methods.qr")}{" "}
                    <span className="font-semibold">
                      {tPayment("payment-methods.fee", {
                        fee: "0đ",
                      })}
                    </span>
                  </Radio>
                  <Radio value="1">
                    {tPayment("payment-methods.banking")}{" "}
                    <span className="font-semibold">
                      {tPayment("payment-methods.fee", {
                        fee: "0đ",
                      })}
                    </span>
                  </Radio>
                  <Radio value="2">
                    {tPayment("payment-methods.direct")}
                    <span className="font-semibold">
                      {tPayment("payment-methods.fee", {
                        fee: "0đ",
                      })}
                    </span>
                  </Radio>
                  {settings?.payment?.OnePaySettings?.is_enable && (
                    <Radio value="3">
                      {tPayment("payment-methods.onepay")}
                      {settings?.payment?.OnePaySettings
                        ?.is_enable_transaction_fee ? (
                        <span className="font-semibold">
                          {tPayment("payment-methods.fee", {
                            fee: `${settings?.payment?.OnePaySettings?.fixedFeePerTransaction}đ + ${settings?.payment?.OnePaySettings?.feePerPercentageOfPaymentAmount}%`,
                          })}
                        </span>
                      ) : (
                        <span className="font-semibold">
                          {tPayment("payment-methods.fee", {
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

                <p className="text-sm text-danger-600">
                  {t("payment-methods.note")}
                </p>

                {isManual && (
                  <p className="text-sm text-danger-600">
                    <strong>Lưu ý:</strong> Trong đơn hàng có chuyến tàu{" "}
                    <strong>{issueTicketSpeedLabel.title}</strong>{" "}
                    {issueTicketSpeedLabel.subTitle}. Sau khi hệ thống xuất vé
                    thành công, bạn sẽ nhận <strong>được vé qua email</strong>.
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
                    Bạn không thể thanh toán hay xuất vé do chuyến tàu đã khởi
                    hành
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
                <div className="flex gap-3 self-end">
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
                            user.customer.balance < remainingAmount
                            ? ""
                            : "hidden"
                        )}
                        onClick={handleRedirectToPaymentPage}
                      >
                        {tPayment("payment-methods.action-button")}
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
            )}

          {!isPaid &&
            booking.booking_status !== BookingStatusEnum.Cancelled && (
              <div
                className={cn(
                  "flex w-full flex-col items-start gap-3 rounded-lg border-1 border-dashed border-default p-2 md:w-2/3",
                  user &&
                    user.customer &&
                    booking &&
                    user.customer.balance < remainingAmount
                    ? "hidden"
                    : ""
                )}
                id="exportSection"
              >
                <h3 className="text-sm font-bold">
                  {tPayment("payment-methods.available")}
                  <span className="text-danger">{`${formatCurrency(user?.customer?.balance || 0)}`}</span>
                </h3>

                <h3 className="text-sm font-bold">
                  {t("payment-methods.remaining")}
                  <span className="text-danger">{`${formatCurrency(
                    remainingAmount
                  )}`}</span>
                </h3>
                {booking.payment_status === BookingPaymentStatusEnum.NotPaid &&
                  booking.booking_status === BookingStatusEnum.Requested &&
                  booking.payment_expired_at && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-warning-700">{`Hạn thanh toán: `}</span>
                      <span className="text-sm">
                        {format(booking.payment_expired_at, "HH:mm dd/MM/yyyy")}
                      </span>

                      <TooltipResponsive>
                        <TooltipResponsiveTrigger asChild>
                          <div className="ml-2 flex h-fit w-fit max-w-[90vw] items-center justify-center rounded-md bg-warning-200 p-1 text-xs font-normal text-warning-700">
                            <MdInfoOutline />
                          </div>
                        </TooltipResponsiveTrigger>
                        <TooltipResponsiveContent>
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
                    {issueTicketSpeedLabel.subTitle}. Sau khi hệ thống xuất vé
                    thành công, bạn sẽ nhận <strong>được vé qua email</strong>.
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
                    Bạn không thể thanh toán hay xuất vé do chuyến tàu đã khởi
                    hành
                  </p>
                )}
                <div className="flex gap-3 self-end">
                  <Tooltip>
                    <TooltipTrigger className={isEnableExportButton} asChild>
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
            )}
        </div>
      </div>
      <div className="hidden w-full flex-col gap-3 rounded-lg bg-background p-3 shadow-md lg:flex">
        <div className="flex flex-row items-center justify-between">
          <p className="font-semibold">{t("order-detail-information.title")}</p>
          <ButtonExportPassenger booking={booking} />
        </div>

        <OrderDetailModal
          order={booking.depart_order}
          handleDownloadFileCallback={handleDownloadDepartFileCallback}
          isDisabledEdit={isDisabledEdit}
          booking={booking}
          handleClickEditIconButton={handleClickEditIconButton}
          handleOpenPaymentModal={handleOpenPaymentModal}
          scrollToPaymentSection={scrollToPaymentSection}
        />

        {booking.return_order && (
          <OrderDetailModal
            order={booking.return_order}
            handleDownloadFileCallback={handleDownloadReturnFileCallback}
            isDisabledEdit={isDisabledEdit}
            booking={booking}
            handleClickEditIconButton={handleClickEditIconButton}
            handleOpenPaymentModal={handleOpenPaymentModal}
            scrollToPaymentSection={scrollToPaymentSection}
          />
        )}
      </div>
      <div className="flex w-full flex-col gap-3 lg:hidden">
        <div className="flex flex-row flex-wrap items-center justify-between gap-3">
          <p className="text-base font-bold">
            {t("order-detail-information.title")}
          </p>
          <ButtonExportPassenger
            booking={booking}
            className="w-full flex-wrap"
          />
        </div>
        <div className="w-full rounded-lg bg-background p-3 shadow-md">
          {booking.depart_order && (
            <OrderInfoCard
              order={booking.depart_order}
              isDisabledEdit={isDisabledEdit}
              handleClickEditIconButton={handleClickEditIconButton}
              booking={booking}
            />
          )}
        </div>
        {booking?.return_order && (
          <div className="w-full rounded-lg bg-background p-3 shadow-md">
            <OrderInfoCard
              order={booking.return_order}
              isDisabledEdit={isDisabledEdit}
              handleClickEditIconButton={handleClickEditIconButton}
              booking={booking}
            />
          </div>
        )}
      </div>
      <PaymentModal isOpen={isOpen} setIsOpen={setIsOpen} booking={booking} />
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
  );
};

export default memo(withPageRequiredAuth(UserBookingDetail));
