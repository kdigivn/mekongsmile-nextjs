"use client";

import { Card } from "@/components/ui/card";
import { TransactionTypeEnum } from "@/services/apis/bookings/transactions/types/transaction-type-enum";
import { useGeneratePaymentUrlMutation } from "@/services/apis/payments/payments.service";
import { useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect } from "react";
import OnepayLoader from "./loader/onepay-loader";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { buildURL, gatewayEndpoints } from "../utils";
import { useTranslation } from "@/services/i18n/client";

type Response = {
  paymentUrl: string;
};
function Onepay() {
  const { t } = useTranslation("booking");
  const searchParams = useSearchParams();

  const customerId = searchParams.get("customerId") ?? 0;
  const paymentAmount = searchParams.get("paymentAmount") ?? 0;
  const bookingId = searchParams.get("booking_id") ?? "";
  const paymentMethod = searchParams.get("payment_method") ?? "";
  const agreedTerms = searchParams.get("agreedTerms") ?? "";

  const generateOnepayUrl = useGeneratePaymentUrlMutation();

  const handleGenerateOnepayUrl = useCallback(async () => {
    try {
      const returnUrl = buildURL(
        `${process.env.NEXT_PUBLIC_BASE_URL}${gatewayEndpoints.onepay.result}`,
        {
          payment_method: paymentMethod,
          booking_id: bookingId,
          agreedTerms: agreedTerms,
          customerId: customerId,
          paymentAmount: paymentAmount,
        }
      ).toString();

      const data = (await generateOnepayUrl.postPaymentAsync({
        type: TransactionTypeEnum.PayBooking,
        id: bookingId,
        paymentAmount: Number(paymentAmount) as number,
        returnUrl: returnUrl,
      })) as Response;

      if (data) {
        setTimeout(() => {
          window.location.href = data.paymentUrl;
        }, 5000);
        return;
      } else {
        console.error("Error in confirm issue process:", data);
        return;
      }
    } catch (error) {
      // Xử lý bất kỳ lỗi nào xảy ra trong quá trình
      console.error("Error in confirm issue process:", error);
    }
  }, [
    agreedTerms,
    bookingId,
    customerId,
    generateOnepayUrl,
    paymentAmount,
    paymentMethod,
  ]);

  useEffect(() => {
    handleGenerateOnepayUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Card className="mx-auto my-4 flex w-full max-w-fit items-center justify-center">
      <OnepayLoader loadingText={t("payment.onepay.loading-connect")} />
    </Card>
  );
}

export default memo(withPageRequiredAuth(Onepay));
