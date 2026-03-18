"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { memo, useMemo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import SignInForm from "@/app/(language)/sign-in/_components/sign-in-form";
import OTPForm from "@/app/(language)/sign-in/_components/otp-form";
import VerifyEmailForm from "@/app/(language)/sign-in/_components/verify-email-form";

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  path: string;
  //   isSignUpOpen: boolean;
  onSignUpOpenChange: (isOpen: boolean) => void;
};

export enum STEPS {
  REGISTER = "REGISTER",
  EMAIL = "EMAIL",
  VERIFY_EMAIL = "VERIFY_EMAIL",
  PASSWORD = "PASSWORD",
  OTP = "OTP",
}
const QuickSignInModal = ({
  isOpen,
  onOpenChange,
  onSignUpOpenChange,
}: Props) => {
  const [step, setStep] = useState<STEPS>(STEPS.EMAIL);
  const [emailValue, setEmailValue] = useState<string | undefined>("");

  const { t } = useTranslation("sign-in");
  const { hideNav, showNav } = useMobileBottomNavActions();

  const handlePrevStep = useCallback(() => {
    setStep(STEPS.EMAIL);
  }, []);

  const handleVerified = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (isOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isOpen, showNav]);

  const onOpenSignUp = useCallback(() => {
    onOpenChange(false);
    onSignUpOpenChange(true);
  }, [onOpenChange, onSignUpOpenChange]);

  const className = useMemo(
    () => ({
      container: "flex !w-[280px] flex-col gap-x-6",
      passwordContainer: "w-[280px]",
      header: "hidden",
      footer: "hidden",
    }),
    []
  );

  const otpClassName = useMemo(() => ({ header: "hidden" }), []);
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="box-content flex w-[280px] flex-col items-start justify-center gap-4 overflow-hidden rounded-lg p-6">
        <DialogTitle className="text-lg font-semibold transition-all duration-200 ease-in-out">
          {t("sign-in:actions.submit")}

          <DialogDescription>
            {`${step === STEPS.OTP ? "vui lòng nhập mã OTP kích hoạt tài khoản." : step === STEPS.VERIFY_EMAIL ? "Xác thực email của bạn!" : "Vui lòng đăng nhập tài khoản để tiếp tục."}`}
          </DialogDescription>
        </DialogTitle>
        <div
          className={`${step === STEPS.OTP || step === STEPS.VERIFY_EMAIL ? "" : "-translate-x-[304px]"} flex w-[888px] gap-6 transition-all duration-200 ease-in-out`}
        >
          <div className="w-[280px]">
            {step === STEPS.OTP && (
              <OTPForm
                handlePrevStep={handlePrevStep}
                emailValue={emailValue}
                className={otpClassName}
                handleVerified={handleVerified}
              />
            )}

            {step === STEPS.VERIFY_EMAIL && (
              <VerifyEmailForm
                handlePrevStep={handlePrevStep}
                emailValue={emailValue}
                className={className}
              />
            )}
          </div>
          <div
            className={`flex w-[584px] gap-6 transition-all duration-200 ease-in-out`}
          >
            <SignInForm
              step={step}
              emailValue={emailValue}
              setEmailValue={setEmailValue}
              setStep={setStep}
              handlePrevStep={handlePrevStep}
              handleGoSignUp={onOpenSignUp}
              handleVerified={handleVerified}
              className={className}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(QuickSignInModal);
