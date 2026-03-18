"use client";

import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TbLoader2 } from "react-icons/tb";
import OtpInputField from "@/views/post/form/otp-input-field";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { toast } from "sonner";
import {
  useResendOTPService,
  useVerifyEmailOTPAndResetPasswordService,
} from "@/services/apis/auth/auth.service";
import useAuthStatusFetcher from "@/services/auth/useAuthStatusFetcher";
import { cn } from "@heroui/react";

type OTPFormProps = {
  handlePrevStep: () => void;
  emailValue?: string;
  handleVerified?: () => void;
  className?: {
    container?: string;
    header?: string;
    footer?: string;
  };
  isResendOTP?: boolean;
};

function OTPForm({
  handlePrevStep,
  emailValue,
  className,
  handleVerified,
  isResendOTP = false,
}: OTPFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [resendOTPLoading, setResendOTPLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(60);

  const verifyEmailOTPAndResetPassword =
    useVerifyEmailOTPAndResetPasswordService();
  const resendEmailOTP = useResendOTPService();
  const { fetchAuthStatus } = useAuthStatusFetcher();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasResentOTP = useRef<boolean>(isResendOTP);

  const otpMethods = useForm(
    useMemo(
      () => ({
        resolver: yupResolver(
          yup.object().shape({
            otp: yup.string().required("Bắt buộc nhập mã OTP"),
          })
        ),
        defaultValues: {
          otp: "",
        },
      }),
      []
    )
  );

  const handleResendOTP = useCallback(
    async (emailDefault?: string) => {
      const email = emailDefault || emailValue;
      if (email) {
        setResendOTPLoading(true);
        const response = await resendEmailOTP(email);
        setResendOTPLoading(false);
        if (response.status !== HTTP_CODES_ENUM.OK) {
          toast.error("Có lỗi xảy ra, vui lòng thử lại sau");
        } else {
          setCountdown(60);
        }
      }
    },
    [emailValue, resendEmailOTP]
  );

  const { control, handleSubmit } = otpMethods;

  const onOtpSubmit = useCallback(
    async (formData: { otp: string }) => {
      setIsLoading(true);
      const { status } = await verifyEmailOTPAndResetPassword(
        emailValue ?? "",
        formData.otp
      );
      setIsLoading(false);
      if (status !== HTTP_CODES_ENUM.OK) {
        toast.error("Mã OTP không hợp lệ");
        return;
      } else {
        fetchAuthStatus();
        handleVerified?.();
      }
    },
    [
      emailValue,
      fetchAuthStatus,
      handleVerified,
      verifyEmailOTPAndResetPassword,
    ]
  );

  const handleResendOTPCallback = useCallback(() => {
    handleResendOTP();
  }, [handleResendOTP]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown((prevCountdown) =>
          prevCountdown !== null ? prevCountdown - 1 : 0
        );
      }, 1000);
    } else if (countdown === 0) {
      clearInterval(intervalRef.current as NodeJS.Timeout);
      intervalRef.current = null;
    }
    if (!hasResentOTP.current) {
      handleResendOTP();
      hasResentOTP.current = true;
    }

    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [countdown, handleResendOTP]);

  return (
    <FormProvider {...otpMethods}>
      <form
        onSubmit={handleSubmit(onOtpSubmit)}
        className={cn("flex w-[288px] flex-col gap-4", className?.container)}
      >
        <h2
          className={cn("text-center text-xl font-semibold", className?.header)}
        >
          {"Xác thực email bằng OTP!"}
        </h2>
        <div className="post-detail">
          Vui lòng kiểm tra{" "}
          <a
            href={"https://mail.google.com/mail/u/0/"}
            target="_blank"
            rel="noopener noreferrer"
          >
            email của bạn
          </a>{" "}
          để lấy mã OTP
        </div>

        <OtpInputField
          control={control}
          name="otp"
          inputClassName="!p-3 border-1 border-solid border-default-300 rounded-md h-12"
          isRequired
        />

        <Button
          type="submit"
          className="flex flex-row items-center gap-2 px-6 py-2"
          disabled={isLoading}
        >
          Xác thực{" "}
          {isLoading && <TbLoader2 className="mr-2 h-4 w-4 animate-spin" />}
        </Button>
        <Button
          className="flex flex-row items-center gap-2 px-6 py-2"
          disabled={countdown !== 0}
          onClick={handleResendOTPCallback}
          type="button"
        >
          Gửi lại mã OTP
          {countdown && countdown > 0 ? ` - ${countdown} giây` : ""}
          {resendOTPLoading && (
            <TbLoader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
        </Button>

        <Button
          type="button"
          onClick={handlePrevStep}
          className="px-6 py-2"
          disabled={isLoading}
        >
          Quay lại
        </Button>
      </form>
    </FormProvider>
  );
}

export default memo(OTPForm);
