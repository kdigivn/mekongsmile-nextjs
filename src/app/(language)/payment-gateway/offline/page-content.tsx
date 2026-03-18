"use client";

import { useTranslation } from "@/services/i18n/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useCheckMobile } from "@/hooks/use-check-screen-type";
import { TiPhoneOutline } from "react-icons/ti";
import { memo, useCallback } from "react";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { Button } from "@/components/ui/button";

function Payment() {
  const searchParams = useSearchParams();
  const isMobile = useCheckMobile();
  const { t } = useTranslation("booking");
  const router = useRouter();

  const bookingId = searchParams.get("booking_id") ?? "";
  const paymentMethod = searchParams.get("payment_method") ?? "";
  const agreedTerms = searchParams.get("agreedTerms") ?? "";
  const redirectBack = searchParams.get("redirectBack") ?? "";

  const handleRedirectToBookingPage = useCallback(() => {
    let url = "";
    if (redirectBack === "booking") {
      url = `/booking/${bookingId}/?payment_method=${paymentMethod}&booking_id=${bookingId}&agreedTerms=${agreedTerms}`;
    } else {
      url = `/user/bookings/${bookingId}/?payment_method=${paymentMethod}&booking_id=${bookingId}&agreedTerms=${agreedTerms}`;
    }

    router.push(url);
  }, [redirectBack, router, bookingId, paymentMethod, agreedTerms]);

  return (
    <Card className="mx-auto my-4 w-full max-w-fit">
      <>
        <CardHeader>
          <CardTitle>{t("payment-methods.direct-method.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 p-3 pb-8 pt-0">
            <div className="flex w-full flex-col items-center p-2">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d86027.75051296347!2d105.737855!3d10.0205472!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a08948fcdd1c87%3A0x4232af8e88fe18e7!2zVsOpIFTDoHUgQ2FvIFThu5FjIC0gRkVSUlkgVk4!5e1!3m2!1svi!2s!4v1761117749409!5m2!1svi!2s"
                width={isMobile ? "315" : "615"}
                height={isMobile ? "315" : "325"}
                loading="lazy"
              />
            </div>
            <h3 className="text-sm font-bold">
              {t("payment-methods.direct-method.contactInformation")}
            </h3>
            <p className="text-sm">
              {t("payment-methods.direct-method.message")}
            </p>

            <p className="text-sm">
              {t("payment-methods.direct-method.address")}{" "}
              {t("payment-methods.direct-method.ncmkAdress")}
            </p>
            <p className="flex flex-row items-center gap-2 text-sm font-bold">
              {t("payment-methods.direct-method.hotline")}{" "}
              <span className="flex w-fit flex-none flex-row justify-center gap-1.5 rounded-sm bg-primary-200 p-1.5 text-sm font-bold leading-4">
                <TiPhoneOutline className="h-4 w-4 flex-none" /> 0924299898
              </span>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex w-full justify-center">
          <Button
            type="submit"
            className="w-fit !flex-none rounded-md px-6 py-2"
            onClick={handleRedirectToBookingPage}
          >
            OK
          </Button>
        </CardFooter>
      </>
    </Card>
  );
}

export default memo(withPageRequiredAuth(Payment));
