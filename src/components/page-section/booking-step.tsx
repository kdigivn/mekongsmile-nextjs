"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/services/i18n/client";
import { memo } from "react";
import { BsCheck2 } from "react-icons/bs";
type Step = {
  stepNumber: number;
  label: string;
};
type Props = {
  currentStep: number;
  className?: string;
  onStepClick?: () => void;
  onStepClickStep1?: () => void;
  isDisabledEdit?: boolean;
};
function BookingStep({
  currentStep = 1,
  className,
  onStepClick,
  onStepClickStep1,
  isDisabledEdit,
}: Props) {
  const { t } = useTranslation("booking-stepper");

  const steps: Step[] = [
    {
      stepNumber: 1,
      label: t("step.1"),
    },
    {
      stepNumber: 2,
      label: t("step.2"),
    },
    {
      stepNumber: 3,
      label: t("step.3"),
    },
  ];

  return (
    <ol
      className={cn(
        "flex w-full items-center text-center text-sm font-medium text-default dark:text-primary sm:text-base",
        className
      )}
    >
      {steps.map((step) => (
        <li
          key={step.stepNumber}
          className={cn(
            "inline-flex min-h-7 min-w-7 flex-1 items-center align-middle text-xs",
            step.stepNumber > 1 &&
              "before:me-2 before:h-px before:w-full before:flex-1 before:bg-default-400 before:content-['']",
            step.stepNumber < steps.length &&
              "after:ms-2 after:h-px after:w-full after:flex-1 after:bg-default-400 after:content-['']",
            step.stepNumber === 1 && currentStep === 2 && "cursor-pointer"
          )}
        >
          <div
            className={cn(
              "flex flex-col items-center gap-4",
              ((step.stepNumber === currentStep - 1 && currentStep !== 3) ||
                (currentStep === 3 && step.stepNumber === 1) ||
                (currentStep === 3 &&
                  step.stepNumber < 3 &&
                  !isDisabledEdit)) &&
                "cursor-pointer" // Cho phép cursor-pointer cho step trước currentStep hoặc tất cả step khi currentStep === 3
            )}
            onClick={() => {
              if (currentStep === 3) {
                // Logic mới: Cho phép click khi currentStep === 3
                if (step.stepNumber === 1 && onStepClickStep1) {
                  onStepClickStep1();
                } else if (
                  step.stepNumber === 2 &&
                  onStepClick &&
                  !isDisabledEdit
                ) {
                  onStepClick();
                }
              } else if (step.stepNumber === currentStep - 1 && onStepClick) {
                // Logic gốc: Gọi onStepClick cho step trước currentStep
                onStepClick();
              }
            }}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full",
                step.stepNumber <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-default-300 text-default-600"
              )}
            >
              {step.stepNumber < currentStep ? <BsCheck2 /> : step.stepNumber}
            </span>
            <p
              className={cn(
                step.stepNumber <= currentStep
                  ? "text-xs font-bold text-foreground"
                  : "text-xs font-bold text-default"
              )}
            >
              {step.label}
            </p>
          </div>
          {/* {step.stepNumber !== steps.length && (
            <div className="ms-2 h-px w-full flex-1 bg-default-200 group-last:hidden dark:bg-neutral-700"></div>
          )} */}
        </li>
      ))}
    </ol>
  );
}

export default memo(BookingStep);
