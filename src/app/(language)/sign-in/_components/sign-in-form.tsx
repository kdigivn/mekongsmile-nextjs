"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "@/services/i18n/client";
import { Link, Spinner } from "@heroui/react";
import FormTextInput from "@/components/form-elements/text-input/form-text-input";
import FormCheckboxInput from "@/components/form-elements/checkbox/form-checkbox-input";
import { isGoogleAuthEnabled } from "@/services/social-auth/google/google-config";
import { isFacebookAuthEnabled } from "@/services/social-auth/facebook/facebook-config";
import SocialAuth from "@/services/social-auth/social-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  useAuthLoginService,
  useEmailCheckService,
} from "@/services/apis/auth/auth.service";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { STEPS } from "../../ticket-detail/_components/_modal/quick-login-modal";

type CheckboxType = {
  id: string;
  value: string;
};

const useValidationSchema = () => {
  const { t } = useTranslation("sign-in");

  return yup.object().shape({
    email: yup
      .string()
      .email(t("sign-in:inputs.email.validation.invalid"))
      .required(t("sign-in:inputs.email.validation.required")),
    password: yup
      .string()
      .required(t("sign-in:inputs.password.validation.required"))
      .min(6, t("sign-in:inputs.password.validation.min")),
  });
};

type SignInFormProps = {
  step: STEPS;
  emailValue?: string;
  className?: {
    container?: string;
    passwordContainer?: string;
    header?: string;
    footer?: string;
  };
  handleGoSignUp?: () => void;
  handlePrevStep: () => void;
  setStep: (step: STEPS) => void;
  setEmailValue: (email: string) => void;
  handleVerified?: () => void;
};

function SignInForm({
  step,
  emailValue,
  className,
  handlePrevStep,
  setEmailValue,
  setStep,
  handleGoSignUp,
  handleVerified,
}: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const emailCheck = useEmailCheckService();
  const fetchAuthLogin = useAuthLoginService();
  const router = useRouter();

  const { t } = useTranslation("sign-in");
  const validationSchema = useValidationSchema();
  const { setTokensInfo } = useAuthTokens();

  const methods = useForm(
    useMemo(
      () => ({
        resolver: yupResolver(validationSchema),
        defaultValues: {
          email: emailValue ?? "",
          password: "000000",
        },
      }),
      [emailValue, validationSchema]
    )
  );

  const { handleSubmit, reset } = methods;

  const checkboxOption: CheckboxType[] = useMemo(
    () => [{ id: "1", value: t("inputs.remember.label") }],
    [t]
  );

  //   const handleOTPStep = useCallback(() => {
  //     setStep(STEPS.OTP);
  //   }, [setStep]);

  const handlePasswordStep = useCallback(
    (emailDefault?: string) => {
      reset({ email: emailDefault ?? emailValue });
      setStep(STEPS.PASSWORD);
    },
    [reset, setStep, emailValue]
  );

  const onSubmit = useCallback(
    async (formData: { email: string; password: string }) => {
      setIsLoading(true);
      setEmailValue(formData.email);
      if (step === STEPS.EMAIL) {
        const { status, data } = await emailCheck({ email: formData.email });

        if (status === HTTP_CODES_ENUM.OK) {
          if (data.isExist && data.isEmailVerified) {
            handlePasswordStep(formData.email);
            setIsLoading(false);
            return;
          }
          if (data.isExist) {
            if (data.isEmailVerified === false) {
              switch (data.provider) {
                case "email":
                  toast.error("Email chưa được xác thực");
                  setStep(STEPS.VERIFY_EMAIL);
                  break;
                case "emailOtp":
                  setStep(STEPS.OTP);
                  break;
                default:
                  toast.error("Phương thức đăng nhập không được hỗ trợ");
              }
            }
            setIsLoading(false);
            return;
          } else {
            toast.error("Email không tồn tại");
            setIsLoading(false);
            return;
          }
        }
      }

      const { data, status } = await fetchAuthLogin(formData);

      if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        toast.error("Thông tin đăng nhập không hợp lệ");
        setIsLoading(false);
        return;
      }

      if (status === HTTP_CODES_ENUM.OK) {
        setTokensInfo({
          refreshToken: data.refreshToken,
        });
        handleVerified?.();
      }
      setIsLoading(false);
    },
    [
      emailCheck,
      fetchAuthLogin,
      handlePasswordStep,
      handleVerified,
      setEmailValue,
      setStep,
      setTokensInfo,
      step,
    ]
  );

  const handleOnClickSignUp = useCallback(() => {
    if (handleGoSignUp) {
      handleGoSignUp();
    } else {
      router.push("/sign-up");
    }
  }, [handleGoSignUp, router]);

  const handleChangeEmail = useCallback(() => {
    methods.reset({ email: emailValue ?? "", password: "000000" });
    handlePrevStep();
  }, [emailValue, handlePrevStep, methods]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          "flex w-72 flex-none flex-col gap-4 md:w-[340px] md:rounded-lg md:bg-white md:bg-opacity-90 md:px-6 md:py-4 md:backdrop-blur-md md:dark:bg-black md:dark:bg-opacity-70 md:dark:backdrop-blur-md lg:w-72 lg:p-0",
          className?.container
        )}
      >
        <h2
          className={cn("text-center text-xl font-semibold", className?.header)}
        >
          {t("sign-in:welcome")}!
        </h2>
        {[isGoogleAuthEnabled, isFacebookAuthEnabled].some(Boolean) && (
          <>
            <div className="flex flex-col overflow-hidden rounded-md border-1 border-primary">
              <SocialAuth />
            </div>
            <p className="w-full text-center text-sm text-black dark:text-white">
              {t("sign-in:or")}
            </p>
          </>
        )}

        <div className="relative">
          <FormTextInput
            name="email"
            placeholder={t("sign-in:inputs.email.placeholder")}
            label={t("sign-in:inputs.email.label")}
            type="email"
            testId="email"
            autoFocus
            radius="sm"
            disabled={step === STEPS.PASSWORD}
          />
          {step === STEPS.PASSWORD && (
            <span
              className="absolute right-3 top-2 cursor-pointer text-xs text-primary underline"
              onClick={handleChangeEmail}
            >
              Thay đổi
            </span>
          )}
        </div>

        {step === STEPS.PASSWORD && (
          <div
            className={cn("flex flex-row gap-2", className?.passwordContainer)}
          >
            <FormTextInput
              name="password"
              placeholder={t("sign-in:inputs.password.placeholder")}
              label={t("sign-in:inputs.password.label")}
              type="password"
              testId="password"
              radius="sm"
            />
          </div>
        )}

        <div
          className={cn(
            "flex flex-row items-center justify-between !text-sm",
            className?.footer
          )}
        >
          <div>
            <FormCheckboxInput<CheckboxType>
              name="rememberCheckBox"
              options={checkboxOption}
              keyValue={"value"}
              size="sm"
              // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
              keyExtractor={(option) => option.id}
              // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
              renderOption={(option) => option.value}
            />
          </div>
          <span className="">
            <Link
              href={"/forgot-password"}
              underline="hover"
              color="foreground"
              className="text-sm"
            >
              {t("sign-in:actions.forgotPassword")}
            </Link>
          </span>
        </div>
        <div className="flex flex-row">
          <Button
            id="btn-sign-in"
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md"
          >
            <Spinner
              color="white"
              size="sm"
              className={cn("mr-1", !isLoading && "hidden")}
            />
            {t("sign-in:actions.submit")}
          </Button>
        </div>
        <div className="flex justify-end">
          <div className="post-detail flex items-center justify-center gap-1 self-end !text-sm font-semibold">
            {t("sign-in:actions.createAccount:ask")}
            <Button
              onClick={handleOnClickSignUp}
              variant={"link"}
              type="button"
              className="inline !p-0 font-bold"
            >
              <a className="!cursor-pointer text-primary">
                {" "}
                {t("sign-in:actions.createAccount:link")}
              </a>
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

export default memo(SignInForm);
