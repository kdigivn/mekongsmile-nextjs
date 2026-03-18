"use client";

import { TbLoader2 } from "react-icons/tb";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { toast } from "sonner";
import { useResendVerifyEmailService } from "@/services/apis/auth/auth.service";
import { cn } from "@heroui/react";

type VerifyEmailFormProps = {
  handlePrevStep: () => void;
  emailValue?: string;
  className?: {
    container?: string;
    header?: string;
    footer?: string;
  };
};

function VerifyEmailForm({
  handlePrevStep,
  emailValue,
  className,
}: VerifyEmailFormProps) {
  const [ResendVerifyEmailLoading, setResendVerifyEmailLoading] =
    useState(false);
  const [countdown, setCountdown] = useState<number | null>(60);

  const resendEmailVerify = useResendVerifyEmailService();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasResentOTP = useRef<boolean>(false);

  const handleResendVerifyEmail = useCallback(
    async (emailDefault?: string) => {
      const email = emailDefault || emailValue;
      if (email) {
        setResendVerifyEmailLoading(true);
        const response = await resendEmailVerify(email);
        setResendVerifyEmailLoading(false);
        if (response.status !== HTTP_CODES_ENUM.OK) {
          toast.error("Có lỗi xảy ra, vui lòng thử lại sau");
        } else {
          setCountdown(60);
        }
      }
    },
    [emailValue, resendEmailVerify]
  );

  const handleResendVerifyEmailCallback = useCallback(() => {
    handleResendVerifyEmail();
  }, [handleResendVerifyEmail]);

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
      handleResendVerifyEmail();
      hasResentOTP.current = true;
    }

    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [countdown, handleResendVerifyEmail]);

  return (
    <div
      className={cn(
        "flex w-72 flex-none flex-col gap-4 md:w-[340px] md:rounded-lg md:bg-white md:bg-opacity-90 md:px-6 md:py-4 md:backdrop-blur-md md:dark:bg-black md:dark:bg-opacity-70 md:dark:backdrop-blur-md lg:w-72 lg:p-0",
        className?.container
      )}
    >
      <h2
        className={cn("text-center text-xl font-semibold", className?.header)}
      >
        {"Xác thực email của bạn!"}
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
        để nhận link xác thực. Sau khi email được xác thực bạn có thể đăng nhập
        lại.
      </div>

      <Button
        className="flex flex-row items-center gap-2 px-6 py-2"
        disabled={countdown !== 0}
        onClick={handleResendVerifyEmailCallback}
        type="button"
      >
        Gửi lại email xác thực
        {countdown && countdown > 0 ? ` - ${countdown} giây` : ""}
        {ResendVerifyEmailLoading && (
          <TbLoader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
      </Button>

      <Button type="button" onClick={handlePrevStep} className="px-6 py-2">
        Quay lại
      </Button>
    </div>
  );
}

export default memo(VerifyEmailForm);
