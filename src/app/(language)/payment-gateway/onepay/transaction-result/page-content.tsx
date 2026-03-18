"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { Button } from "@/components/ui/button";
import { PaymentResponseCode } from "@/services/apis/payments/types/payment-error-enum";
import {
  OnepayCheckResponse,
  useCheckOnepayService,
  useGeneratePaymentUrlMutation,
} from "@/services/apis/payments/payments.service";
import { TransactionTypeEnum } from "@/services/apis/bookings/transactions/types/transaction-type-enum";
import { motion } from "framer-motion";
import { useTranslation } from "@/services/i18n/client";
import { MdDone } from "react-icons/md";
import { buildURL, gatewayEndpoints } from "../../utils";
import OnepayLoader from "../loader/onepay-loader";

type Response = {
  paymentUrl: string;
};

function TransactionResult() {
  const { t } = useTranslation("booking");
  const searchParams = useSearchParams();
  const router = useRouter();
  const responseCode = searchParams.get("vpc_TxnResponseCode") ?? "";
  const paymentMethod = searchParams.get("payment_method") ?? "";
  const agreedTerms = searchParams.get("agreedTerms") ?? "";
  const customerId = searchParams.get("customerId") ?? "";
  const paymentAmount = searchParams.get("paymentAmount") ?? "";
  const [loading, setLoading] = useState<boolean>(false);

  // Check run onece
  const [checkRunOnce, setCheckRunOnce] = useState<boolean>(false);

  const [checkVerifyOnepay, setCheckVerifyOnepay] = useState(false);

  const [countdown, setCountdown] = useState<number | null>(4);
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // useRef to store interval
  const [isCountdownFinished, setIsCountdownFinished] = useState(false);

  const onepayCheck = useCheckOnepayService();

  const bookingId = searchParams.get("booking_id") ?? "";

  const handleReturnBooking = useCallback(() => {
    router.push(
      `/booking/${bookingId}/?payment_method=${paymentMethod}&booking_id=${bookingId}&agreedTerms=${agreedTerms}`
    );
  }, [agreedTerms, bookingId, paymentMethod, router]);

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
        id: bookingId as string,
        paymentAmount: Number(paymentAmount) as number,
        returnUrl: returnUrl,
      })) as Response;

      if (data) {
        window.location.href = data.paymentUrl;
        return;
      } else {
        console.error("Error in gene issue process:", data);
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
    const checkOnepayAndProceed = async () => {
      try {
        setCheckRunOnce(true);
        const searchParamsString = searchParams ? searchParams.toString() : "";
        // Check Onepay status first
        const { data } = await onepayCheck({
          searchParams: searchParamsString,
        });

        if (!(data as OnepayCheckResponse).valid) {
          console.log("Fail Hash");
          setCheckVerifyOnepay(false);
          setLoading(true);
          return;
        } else {
          setLoading(true);
          setCheckVerifyOnepay(true);
          // Only proceed if responseCode is Success and data is valid
          if (responseCode === PaymentResponseCode.Success) {
            // Handle countdown timer
            if (countdown !== null && countdown > 0) {
              intervalRef.current = setInterval(() => {
                setCountdown((prevCountdown) =>
                  prevCountdown !== null ? prevCountdown - 1 : null
                );
              }, 1000);

              // Cleanup interval when countdown reaches 0
              if (countdown === 0) {
                setIsCountdownFinished(true);
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
              }
            }

            // Navigate after delay
            const redirectTimeout = setTimeout(() => {
              router.push(
                `/booking/${bookingId}/check-issue-ticket/?payment_method=${paymentMethod}&booking_id=${bookingId}&agreedTerms=${agreedTerms}`
              );
            }, 5000);

            // Cleanup function
            return () => {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
              clearTimeout(redirectTimeout);
            };
          }
        }
      } catch (error) {
        setLoading(true);
        setCheckVerifyOnepay(false);
        // Handle error cases
        console.error("Onepay verification error:", error);
      }
    };
    // Execute the check
    if (!checkRunOnce) {
      checkOnepayAndProceed();
    }
  }, [
    responseCode,
    countdown,
    router,
    bookingId,
    paymentMethod,
    agreedTerms,
    searchParams,
    onepayCheck,
    checkRunOnce,
  ]);

  const renderPaymentErrorContent = () => {
    switch (responseCode) {
      case PaymentResponseCode.Success:
        return t("transaction-result.payment-response-code.success");

      case PaymentResponseCode.Unknown:
        return t("transaction-result.payment-response-code.unknown");

      case PaymentResponseCode.CardNotEnabled:
        return t("transaction-result.payment-response-code.card-not-enabled");

      case PaymentResponseCode.BankRejected:
        return t("transaction-result.payment-response-code.bank-rejected");

      case PaymentResponseCode.NoBankResponse:
        return t("transaction-result.payment-response-code.no-bank-response");

      case PaymentResponseCode.CardExpired:
        return t("transaction-result.payment-response-code.card-expired");

      case PaymentResponseCode.InsufficientBalance:
        return t(
          "transaction-result.payment-response-code.insufficient-balance"
        );

      case PaymentResponseCode.BankProcessingError:
        return t(
          "transaction-result.payment-response-code.bank-processing-error"
        );

      case PaymentResponseCode.TransactionError:
        return t("transaction-result.payment-response-code.transaction-error");

      case PaymentResponseCode.InvalidCardNumber:
        return t(
          "transaction-result.payment-response-code.invalid-card-number"
        );

      case PaymentResponseCode.InvalidCardHolder:
        return t(
          "transaction-result.payment-response-code.invalid-card-holder"
        );

      case PaymentResponseCode.CardLockedOrExpired:
        return t(
          "transaction-result.payment-response-code.card-locked-or-expired"
        );

      case PaymentResponseCode.CardNotRegistered:
        return t(
          "transaction-result.payment-response-code.card-not-registered"
        );

      case PaymentResponseCode.InvalidExpiryDate:
        return t(
          "transaction-result.payment-response-code.invalid-expiry-date"
        );

      case PaymentResponseCode.InsufficientFunds:
        return t("transaction-result.payment-response-code.insufficient-funds");

      case PaymentResponseCode.InvalidAccountInfo:
        return t(
          "transaction-result.payment-response-code.invalid-account-info"
        );

      case PaymentResponseCode.AccountLocked:
        return t("transaction-result.payment-response-code.account-locked");

      case PaymentResponseCode.InvalidCardInfo:
        return t("transaction-result.payment-response-code.invalid-card-info");

      case PaymentResponseCode.InvalidOTP:
        return t("transaction-result.payment-response-code.invalid-otp");

      case PaymentResponseCode.PaymentTimeout:
        return t("transaction-result.payment-response-code.payment-timeout");

      case PaymentResponseCode.UserCancelled:
        return t("transaction-result.payment-response-code.user-cancelled");

      case PaymentResponseCode.ThreeDSecureAuthFailed:
        return t(
          "transaction-result.payment-response-code.three-d-secure-auth-failed"
        );

      case PaymentResponseCode.InvalidCSC:
        return t("transaction-result.payment-response-code.invalid-csc");

      case PaymentResponseCode.ThreeDSecureVerificationFailed:
        return t(
          "transaction-result.payment-response-code.three-d-secure-verification-failed"
        );

      case PaymentResponseCode.TransactionRejected:
        return t(
          "transaction-result.payment-response-code.transaction-rejected"
        );

      default:
        return t("transaction-result.payment-response-code.default");
    }
  };

  return !loading ? (
    <Card className="mx-auto my-4 flex w-full max-w-fit items-center justify-center">
      <OnepayLoader loadingText={t("payment.onepay.check-transaction")} />
    </Card>
  ) : responseCode === PaymentResponseCode.Success && checkVerifyOnepay ? (
    <Card className="mx-auto my-4 flex w-fit max-w-screen-sm flex-col items-center justify-center gap-3 p-6">
      {/* <PaymentGatewayLoader /> */}
      <div className="flex h-24 w-24 transform animate-appearance-in items-center justify-center rounded-full bg-success opacity-100 transition-all duration-1000 ease-out">
        <MdDone className="h-20 w-20 text-white" />
      </div>
      <p className="text-xl font-bold">{t("payment.notification.success")}</p>
      {isCountdownFinished ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex space-x-2"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
              }}
              className="h-3 w-3 rounded-full bg-primary-500"
            ></motion.div>
          ))}
        </motion.div>
      ) : (
        <>
          {t("payment.loading", {
            second: countdown && countdown > 0 ? countdown : "",
          })}
        </>
      )}
    </Card>
  ) : (
    <Card className="mx-auto my-4 w-full max-w-screen-sm">
      <>
        <CardHeader>
          <CardTitle>Thanh toán thất bại</CardTitle>
        </CardHeader>
        <CardContent className="!pb-2">
          <div className="flex flex-col gap-3 pt-0">
            <p className="my-0 text-base font-normal">
              {!checkVerifyOnepay
                ? t(
                    "transaction-result.payment-response-code.paymentResultInvalid"
                  )
                : renderPaymentErrorContent()}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button
            className="!w-fit flex-1 gap-1 rounded-md bg-info px-6 py-2 text-white hover:bg-info/50"
            onClick={handleGenerateOnepayUrl}
          >
            Thanh toán lại
          </Button>
          <Button
            className="!w-fit flex-1 gap-1 rounded-md bg-danger-500 px-6 py-2 text-white hover:bg-danger/50"
            onClick={handleReturnBooking}
          >
            Hủy thanh toán
          </Button>
        </CardFooter>
      </>
    </Card>
  );
}

export default memo(withPageRequiredAuth(TransactionResult));
