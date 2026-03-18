"use client";

import FormTextInput from "@/components/form-elements/text-input/form-text-input";
import { Button } from "@/components/ui/button";
import { useAuthResetPasswordService } from "@/services/apis/auth/auth.service";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useTranslation } from "@/services/i18n/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";

type PasswordChangeFormData = {
  password: string;
  passwordConfirmation: string;
};

const useValidationSchema = () => {
  const { t } = useTranslation("password-change");

  return yup.object().shape({
    password: yup
      .string()
      .min(6, t("password-change:inputs.password.validation.min"))
      .required(t("password-change:inputs.password.validation.required")),
    passwordConfirmation: yup
      .string()
      .oneOf(
        [yup.ref("password")],
        t("password-change:inputs.passwordConfirmation.validation.match")
      )
      .required(
        t("password-change:inputs.passwordConfirmation.validation.required")
      ),
  });
};

function FormActions() {
  const { t } = useTranslation("password-change");
  const { isSubmitting } = useFormState();

  return (
    <Button type="submit" disabled={isSubmitting} className="w-full rounded-md">
      {t("password-change:actions.submit")}
    </Button>
  );
}

function ExpiresAlert() {
  const { t } = useTranslation("password-change");
  const [isExpired, setIsExpired] = useState(false);

  const expires = useMemo(() => {
    if (typeof window === "undefined") return 0;

    const params = new URLSearchParams(window.location.search);

    return Number(params.get("expires"));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      if (expires < now) {
        clearInterval(interval);
        setIsExpired(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expires]);

  if (isExpired) {
    toast.error(t("password-change:alerts.expired"));
  }
  return <></>;
}

function Form() {
  const fetchAuthResetPassword = useAuthResetPasswordService();
  const { t } = useTranslation("password-change");
  const validationSchema = useValidationSchema();
  const router = useRouter();

  const methods = useForm<PasswordChangeFormData>(
    useMemo(
      () => ({
        resolver: yupResolver(validationSchema),
        defaultValues: {
          password: "",
          passwordConfirmation: "",
        },
      }),
      [validationSchema]
    )
  );

  const { handleSubmit, setError } = methods;

  const onSubmit = async (formData: PasswordChangeFormData) => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const hash = params.get("hash");
    if (!hash) return;

    const { data, status } = await fetchAuthResetPassword({
      password: formData.password,
      hash,
    });

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(data.errors) as Array<keyof PasswordChangeFormData>).forEach(
        (key) => {
          setError(key, {
            type: "manual",
            message: t(
              `password-change:inputs.${key}.validation.server.${data.errors[key]}`
            ),
          });
        }
      );

      return;
    }

    if (status === HTTP_CODES_ENUM.OK) {
      toast.success(t("password-change:alerts.success"));

      router.replace("/sign-in");
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
                {t("password-change:title")}
              </h2>
              <ExpiresAlert />
              <FormTextInput
                name="password"
                label={t("password-change:inputs.password.label")}
                type="password"
              />
              <FormTextInput
                name="passwordConfirmation"
                label={t("password-change:inputs.passwordConfirmation.label")}
                type="password"
              />
              <FormActions />
            </form>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}

function PasswordChange() {
  return <Form />;
}

export default withPageRequiredGuest(PasswordChange);
