"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";

import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import SignInForm from "./_components/sign-in-form";
import OTPForm from "./_components/otp-form";
import VerifyEmailForm from "./_components/verify-email-form";
import { STEPS } from "../ticket-detail/_components/_modal/quick-login-modal";

function SignInPage() {
  const [step, setStep] = useState<STEPS>(STEPS.EMAIL);
  const [emailValue, setEmailValue] = useState<string | undefined>("");

  const handlePrevStep = useCallback(() => {
    setStep(STEPS.EMAIL);
  }, []);

  const formRender = useMemo(() => {
    switch (step) {
      case STEPS.EMAIL:
        return (
          <SignInForm
            step={step}
            emailValue={emailValue}
            setEmailValue={setEmailValue}
            setStep={setStep}
            handlePrevStep={handlePrevStep}
          />
        );
      case STEPS.OTP:
        return (
          <OTPForm handlePrevStep={handlePrevStep} emailValue={emailValue} />
        );
      case STEPS.VERIFY_EMAIL:
        return (
          <VerifyEmailForm
            handlePrevStep={handlePrevStep}
            emailValue={emailValue}
          />
        );
      default:
        return (
          <SignInForm
            step={step}
            emailValue={emailValue}
            setEmailValue={setEmailValue}
            setStep={setStep}
            handlePrevStep={handlePrevStep}
          />
        );
    }
  }, [emailValue, handlePrevStep, step]);

  return (
    <div className="mx-auto w-full lg:max-w-6xl">
      <div className="relative left-0 top-0 w-full">
        <div className="grid h-full w-full grid-cols-12 gap-6 p-4 md:relative">
          <div className="col-span-12 flex h-full w-full items-center justify-center rounded-md bg-white p-4 dark:bg-default-700 dark:bg-opacity-30 md:absolute md:bg-transparent md:dark:bg-transparent lg:relative lg:col-span-6 lg:bg-white lg:dark:bg-black">
            {formRender}
          </div>
          <div className="hidden overflow-hidden rounded-md md:col-span-12 md:flex lg:col-span-6">
            <Image
              className="h-full object-cover object-top"
              src="https://cdn.vetaucaotoc.net/wp-content/uploads/banner-login.webp"
              alt="Login Background Image"
              width={1080}
              height={1080}
              priority
              unoptimized
              sizes="(max-width: 1023px) 0px, 50vw"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withPageRequiredGuest(SignInPage);
