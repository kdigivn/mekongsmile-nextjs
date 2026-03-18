"use client";

import FormTextInput from "@/components/form-elements/text-input/form-text-input";
import { Button } from "@/components/ui/button";
import useRecaptcha from "@/hooks/use-recaptcha";
import { useAuthForgotPasswordService } from "@/services/apis/auth/auth.service";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useTranslation } from "@/services/i18n/client";
import { Alert } from "@heroui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ReCAPTCHAProps } from "react-google-recaptcha";
import type ReCAPTCHAType from "react-google-recaptcha";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";
import React from "react";

const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), {
  ssr: false,
}) as React.ForwardRefExoticComponent<
  ReCAPTCHAProps & React.RefAttributes<ReCAPTCHAType>
>;

type ForgotPasswordFormData = {
  email: string;
};

const useValidationSchema = () => {
  const { t } = useTranslation("forgot-password");

  return yup.object().shape({
    email: yup
      .string()
      .email(t("forgot-password:inputs.email.validation.invalid"))
      .required(t("forgot-password:inputs.email.validation.required")),
  });
};

function FormActions() {
  const { t } = useTranslation("forgot-password");
  // const { isSubmitting } = useFormState();

  return (
    <Button type="submit" disabled={false} className="w-full rounded-md">
      {t("forgot-password:actions.submit")}
    </Button>
  );
}

function Form() {
  const fetchAuthForgotPassword = useAuthForgotPasswordService();
  const { t } = useTranslation("forgot-password");
  const {
    reCaptchaRef,
    handleReCaptchaChange,
    executeRecaptcha,
    resetReCaptchaRef,
    error: captchaError,
  } = useRecaptcha();

  const validationSchema = useValidationSchema();

  const methods = useForm<ForgotPasswordFormData>(
    useMemo(
      () => ({
        resolver: yupResolver(validationSchema),
        defaultValues: {
          email: "",
        },
      }),
      [validationSchema]
    )
  );

  const { handleSubmit, setError } = methods;

  const onSubmit = async (formData: ForgotPasswordFormData) => {
    const token = await executeRecaptcha();
    if (token) {
      const { data, status } = await fetchAuthForgotPassword(formData);

      if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        (
          Object.keys(data.errors) as Array<keyof ForgotPasswordFormData>
        ).forEach((key) => {
          setError(key, {
            type: "manual",
            message: t(
              `forgot-password:inputs.${key}.validation.server.${data.errors[key]}`
            ),
          });
        });

        return;
      }

      if (status === HTTP_CODES_ENUM.OK) {
        toast.success(t("forgot-password:alerts.success"));
      }

      setTimeout(() => resetReCaptchaRef(), 500);
    } else {
      toast.error(
        "Không thể xác minh reCAPTCHA. Vui lòng tắt trình chặn quảng cáo (ad blocker) và thử lại."
      );
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="container min-h-[calc(100vh_-_337px)] max-w-screen-xl py-4">
        <div className="flex w-full justify-center">
          <div className="max-w-lg rounded-lg bg-background p-8 shadow-md lg:flex lg:w-96 lg:max-w-full lg:justify-center">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full flex-col gap-4"
            >
              <h2 className="text-xl font-semibold">
                {t("forgot-password:title")}
              </h2>

              <FormTextInput
                name="email"
                label={t("forgot-password:inputs.email.label")}
                type="email"
              />
              {captchaError && (
                <Alert variant="flat" className="mb-2">
                  {t("captchaVerificationFailed")}
                </Alert>
              )}
              <FormActions />
            </form>
          </div>
        </div>
        <ReCAPTCHA
          ref={reCaptchaRef}
          sitekey={
            process.env.NEXT_PUBLIC_RECAPTCHA_V2_INVISIBLE_SITE_KEY ?? ""
          }
          onChange={handleReCaptchaChange}
          size="invisible"
        />
      </div>
    </FormProvider>
  );
}

function ForgotPassword() {
  return <Form />;
}

export default withPageRequiredGuest(ForgotPassword);
