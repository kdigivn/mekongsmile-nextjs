import ErrorContent from "@/components/error-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Booking } from "@/services/apis/bookings/types/booking";
import { OrderStatusEnum } from "@/services/apis/orders/types/order-status-enum";
import { useTranslation } from "@/services/i18n/client";
import { format } from "date-fns";
import { memo, useEffect, useState } from "react";
import { CiCalendar } from "react-icons/ci";
import { IoIosArrowRoundForward } from "react-icons/io";
import { IoLocationOutline } from "react-icons/io5";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

type ExportTicketModalProps = {
  bookingData?: Booking;
  bookingId: string;
  checkExportTicket: boolean;
  hasDepartError: boolean;
  hasReturnError: boolean;
  defaultTab: string;
  onCloseClick: () => void;
  isDisabledEdit?: boolean;
  handleClickEditIconButton?: () => void;
  handleRedirectIssueTicketAgain?: () => void;
};

const ExportTicketModal = ({
  bookingData,
  bookingId,
  checkExportTicket,
  hasDepartError,
  hasReturnError,
  defaultTab,
  onCloseClick,
  isDisabledEdit,
  handleClickEditIconButton,
  handleRedirectIssueTicketAgain,
}: ExportTicketModalProps) => {
  const { t } = useTranslation("booking");
  // Xác định tabs nào sẽ được hiển thị
  const hasDepartOrder = !!bookingData?.depart_order;
  const hasReturnOrder = !!bookingData?.return_order;

  // Xác định tab mặc định dựa trên orders hiện có
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (defaultTab === "depart" && hasDepartOrder) return "depart";
    if (defaultTab === "return" && hasReturnOrder) return "return";
    if (hasDepartOrder) return "depart";
    if (hasReturnOrder) return "return";
    return "depart"; // Fallback
  });

  // Cập nhật activeTab khi defaultTab hoặc orders thay đổi
  useEffect(() => {
    if (defaultTab === "depart" && hasDepartOrder) setActiveTab("depart");
    else if (defaultTab === "return" && hasReturnOrder) setActiveTab("return");
    else if (hasDepartOrder) setActiveTab("depart");
    else if (hasReturnOrder) setActiveTab("return");
  }, [defaultTab, hasDepartOrder, hasReturnOrder]);

  // Render thông tin thành công
  const renderSuccessContent = () => (
    <div className="flex items-center gap-2 text-green-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <span>Xuất vé thành công</span>
    </div>
  );

  return (
    <Card className="mx-auto my-4 w-full max-w-2xl border-destructive/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {t("export-ticket-modal.export")}{" "}
            {checkExportTicket && (hasReturnError || hasDepartError) && (
              <Badge variant="destructive">
                {!bookingData?.return_order && hasDepartError && (
                  <>{t("export-ticket-modal.export-fail")}</>
                )}

                {bookingData?.return_order && hasDepartError && (
                  <>{t("export-ticket-modal.export-fail")}</>
                )}

                {hasReturnError && hasDepartError && (
                  <>{t("export-ticket-modal.export-fail")}</>
                )}

                {hasReturnError && !hasDepartError && <>thất bại một phần</>}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>

      <Separator />

      {checkExportTicket ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Chỉ hiển thị TabsList khi có ít nhất 2 tabs */}
          {hasDepartOrder && hasReturnOrder && (
            <TabsList className="mx-4 mt-4 grid grid-cols-2">
              <TabsTrigger
                value="depart"
                className="flex items-center gap-1"
                disabled={!hasDepartOrder}
              >
                <MdArrowForward className="h-3.5 w-3.5" />
                Chiều đi
              </TabsTrigger>
              <TabsTrigger
                value="return"
                className="flex items-center gap-1"
                disabled={!hasReturnOrder}
              >
                <MdArrowBack className="h-3.5 w-3.5" />
                Chiều về
              </TabsTrigger>
            </TabsList>
          )}

          {hasDepartOrder && (
            <TabsContent value="depart" className="mt-0">
              <CardContent className="pt-4">
                <div className="mb-4 rounded-lg bg-muted/50 p-3">
                  <div className="mb-1 flex items-center gap-1 text-sm font-medium">
                    <IoLocationOutline className="hidden h-5 w-5 md:flex" />
                    <div className="flex items-center">
                      {bookingData?.depart_order?.voyage?.route
                        ?.departure_name ?? ""}
                      <IoIosArrowRoundForward className="h-5 w-5" />
                      {bookingData?.depart_order?.voyage?.route
                        ?.destination_name ?? ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CiCalendar className="h-5 w-5" />
                    <div>
                      {`${format(
                        new Date(
                          `${bookingData?.depart_order?.voyage?.departure_date}T${bookingData?.depart_order?.voyage?.depart_time}`
                        ),
                        "HH:mm - dd/MM/yyyy"
                      )}`}
                    </div>
                  </div>
                </div>

                {bookingData?.depart_order?.issue_ticket_error &&
                bookingData?.depart_order?.order_status !==
                  OrderStatusEnum.Booked &&
                bookingData?.depart_order?.order_status !==
                  OrderStatusEnum.WaitForIssue ? (
                  <>
                    <ErrorContent
                      error={
                        bookingData?.depart_order?.issue_ticket_error
                          ? JSON.parse(
                              bookingData?.depart_order?.issue_ticket_error
                            )
                          : undefined
                      }
                      tName="booking"
                      isDisabledEdit={isDisabledEdit}
                      bookingData={bookingData}
                      handleClickEditIconButton={handleClickEditIconButton}
                      handleRedirectIssueTicketAgain={
                        handleRedirectIssueTicketAgain
                      }
                      variant="default"
                    />
                    {/* {renderErrorContent(
                      bookingData?.depart_order?.issue_ticket_error
                        ? JSON.parse(
                            bookingData?.depart_order?.issue_ticket_error
                          )?.errorCode
                        : undefined
                    )} */}
                  </>
                ) : (
                  <>
                    {hasDepartError ? (
                      <>
                        {t("bookingProcessing", {
                          bookingId: bookingId,
                        })}
                      </>
                    ) : (
                      renderSuccessContent()
                    )}
                  </>
                )}
              </CardContent>
            </TabsContent>
          )}

          {hasReturnOrder && (
            <TabsContent value="return" className="mt-0">
              <CardContent className="pt-4">
                <div className="mb-4 rounded-lg bg-muted/50 p-3">
                  <div className="mb-1 flex items-center gap-1 text-sm font-medium">
                    <IoLocationOutline className="h-5 w-5" />
                    <div className="flex items-center">
                      {bookingData?.return_order?.voyage?.route
                        ?.departure_name ?? ""}
                      <IoIosArrowRoundForward className="h-5 w-5" />
                      {bookingData?.return_order?.voyage?.route
                        ?.destination_name ?? ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CiCalendar className="h-5 w-5" />
                    <div>
                      {`${format(
                        new Date(
                          `${bookingData?.return_order?.voyage?.departure_date}T${bookingData?.return_order?.voyage?.depart_time}`
                        ),
                        "HH:mm dd/MM/yyyy"
                      )}`}
                    </div>
                  </div>
                </div>

                {bookingData?.return_order?.issue_ticket_error &&
                bookingData?.return_order?.order_status !==
                  OrderStatusEnum.Booked &&
                bookingData?.return_order?.order_status !==
                  OrderStatusEnum.WaitForIssue ? (
                  <>
                    <ErrorContent
                      error={
                        bookingData?.return_order?.issue_ticket_error
                          ? JSON.parse(
                              bookingData?.return_order?.issue_ticket_error
                            )
                          : undefined
                      }
                      tName="booking"
                      isDisabledEdit={isDisabledEdit}
                      bookingData={bookingData}
                      handleClickEditIconButton={handleClickEditIconButton}
                      handleRedirectIssueTicketAgain={
                        handleRedirectIssueTicketAgain
                      }
                      variant="default"
                    />
                    {/* {renderErrorContent(
                      bookingData?.return_order?.issue_ticket_error
                        ? JSON.parse(
                            bookingData?.return_order?.issue_ticket_error
                          )?.errorCode
                        : undefined
                    )} */}
                  </>
                ) : (
                  <>
                    {hasDepartError ? (
                      <>Chưa xuất vé do lỗi ở Chiều đi</>
                    ) : (
                      renderSuccessContent()
                    )}
                  </>
                )}
              </CardContent>
            </TabsContent>
          )}
        </Tabs>
      ) : (
        <CardContent className="pt-4">
          <p>
            {t("booking-no-payment", {
              bookingId: bookingId,
            })}
          </p>
        </CardContent>
      )}

      <CardFooter className="flex justify-end">
        <Button
          className="gap-1 border border-solid border-black bg-transparent text-black shadow-none hover:bg-gray-100"
          onClick={onCloseClick}
        >
          {t("export-ticket-modal.iUnderstand")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default memo(ExportTicketModal);
