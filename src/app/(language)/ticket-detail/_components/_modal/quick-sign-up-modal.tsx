"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import {
  useEmailCheckService,
  useSendEmailOTPService,
} from "@/services/apis/auth/auth.service";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import { yupResolver } from "@hookform/resolvers/yup";
// import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { TbLoader2 } from "react-icons/tb";
import { toast } from "sonner";
import * as yup from "yup";
import FormTextInput from "@/components/form-elements/text-input/form-text-input";
import { cn } from "@/lib/utils";
import OTPForm from "@/app/(language)/sign-in/_components/otp-form";
import { STEPS } from "./quick-login-modal";
import { countries, getCountry } from "@/lib/countries";
import FormPhoneInput from "@/components/form-elements/text-input/form-phone-input";
import { BsExclamationCircle } from "react-icons/bs";

type Props = {
  isOpen: boolean;
  fullName?: string;
  email?: string;
  phone?: string;
  phone_country_code?: string;
  social_id?: string | null;
  onOpenChange: (isOpen: boolean) => void;
  path: string;
  isLoginOpen: boolean;
  onLoginOpenChange: (isOpen: boolean) => void;
};

// Define the type for form inputs
type FormValues = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  phone_country_code: string;
};

const QuickSignUpModal = ({
  isOpen,
  onOpenChange,
  fullName,
  email,
  phone,
  phone_country_code,
  social_id,
  // path,
  onLoginOpenChange,
}: Props) => {
  // const router = useRouter();
  const [step, setStep] = useState(STEPS.REGISTER);
  const [isLoading, setIsLoading] = useState(false);
  const [emailValue, setEmailValue] = useState<string | undefined>(email);
  const { t } = useTranslation("sign-up");

  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (isOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isOpen, showNav]);

  const schema = yup.object().shape({
    email: yup
      .string()
      .email("Email không hợp lệ")
      .required("Bắt buộc nhập email"),
    firstName: yup.string().required("Bắt buộc nhập tên"),
    lastName: yup.string().required("Bắt buộc nhập họ"),
    phone: yup
      .string()
      .max(20, "Số điện thoại phải ít hơn 20 ký tự")
      .required(t("inputs.phone.validation.required")),
    phone_country_code: yup
      .string()
      .required(t("inputs.phone.validation.required")),
    social_id: yup
      .string()
      .trim()
      .nullable()
      .matches(/^(|\d{12})$/, t("inputs.socialId.validation.invalid-length")),
  });

  const sendEmailOTP = useSendEmailOTPService();
  const emailCheck = useEmailCheckService();

  const methods = useForm(
    useMemo(
      () => ({
        resolver: yupResolver(schema),
        defaultValues: {
          email: email || "",
          firstName: fullName
            ? fullName.split(" ")[fullName.split(" ").length - 1]
            : "",
          lastName: fullName ? fullName.split(" ").slice(0, -1).join(" ") : "",
          phone: phone ?? "",
          phone_country_code: phone_country_code ?? "VN",
          social_id: social_id ?? "",
        },
      }),
      [email, fullName, phone, phone_country_code, schema, social_id]
    )
  );

  const { handleSubmit, setError, reset } = methods;

  useEffect(() => {
    if (email && fullName && phone && phone_country_code) {
      reset({
        email,
        firstName: fullName.split(" ")[fullName.split(" ").length - 1],
        lastName: fullName.split(" ").slice(0, -1).join(" "),
        phone: phone,
        phone_country_code: phone_country_code,
        social_id: social_id,
      });
      setEmailValue(email);
    }
  }, [email, fullName, phone, phone_country_code, reset, social_id]);

  const onSubmit = async (formData: FormValues) => {
    setIsLoading(true);
    const emailCheckResponse = await emailCheck({
      email: formData.email,
    });

    if (emailCheckResponse.status === HTTP_CODES_ENUM.OK) {
      const data = emailCheckResponse.data;
      if (data.isExist) {
        setError("email", {
          type: "manual",
          message: "Email đã tồn tại, vui lòng đăng nhập",
        });
        setIsLoading(false);
        return;
      }
    }

    const countryInfo = getCountry(formData.phone_country_code);

    const phoneWithCountryCode = countryInfo?.phone
      ? `+${countryInfo.phone}${formData.phone}`
      : formData.phone;

    const response = await sendEmailOTP(
      formData.email,
      formData.firstName,
      formData.lastName,
      phoneWithCountryCode,
      formData.phone_country_code
    );

    const { status, data } = response;
    setIsLoading(false);
    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(data?.errors) as Array<keyof FormValues>).forEach((key) => {
        setError(key, {
          type: "manual",
          message: t(
            `sign-up:inputs.${key}.validation.server.${data?.errors[key]}`
          ),
        });
      });
      return;
    }
    if (status !== HTTP_CODES_ENUM.OK) {
      toast.error("Đã có lỗi xảy ra, vui lòng thử lại sau");
      return;
    } else {
      if (emailValue !== formData.email) {
        setEmailValue(formData.email);
      }
      handleNextStep();
    }
  };

  const handleVerified = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleNextStep = () => {
    setStep(STEPS.OTP);
  };

  const handlePreviousStep = useCallback(() => {
    setStep(STEPS.REGISTER);
  }, []);

  const onOpenSignIn = useCallback(() => {
    onOpenChange(false);
    onLoginOpenChange(true);
  }, [onLoginOpenChange, onOpenChange]);

  const className = useMemo(
    () => ({ container: "flex !w-[280px] flex-col gap-2", header: "hidden" }),
    []
  );

  const phoneName = useMemo(
    () => ({
      countryCode: "phone_country_code",
      phoneNumber: "phone",
    }),
    []
  );

  const classNames = useMemo(
    () => ({
      base: "flex flex-col gap-1.5 w-full",
      input:
        "!mt-0 h-14 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black md:text-sm rounded-tl-none rounded-bl-none",
      label: "!text-sm top-full font-medium md:!text-sm !text-black",
      countryCodeTrigger:
        "!mt-0 h-14 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black w-full md:text-sm rounded-tr-none rounded-br-none",
      baseCountryCode: "flex flex-col gap-1 space-y-1 w-[80px] flex-none",
      labelCountryCode: "leading-5 text-xs",
      wrapper: "w-full flex flex-row items-center",
      wrapperErrorMessage: "w-full flex flex-row items-center",
    }),
    []
  );

  const defaultPhoneValue = useMemo(
    () => ({
      phoneNumber:
        phone && phone_country_code
          ? phone?.slice(getCountry(phone_country_code).phone.length + 1)
          : "",
      countryCode: phone_country_code ?? "VN",
    }),
    [phone, phone_country_code]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="box-content flex w-[280px] flex-col items-start justify-center gap-4 overflow-hidden rounded-lg p-6">
        <DialogTitle className="text-lg font-semibold transition-all duration-200 ease-in-out">
          <div className={cn(step !== STEPS.REGISTER && "hidden")}>
            Đăng ký
            <DialogDescription>
              Vui lòng đăng ký tài khoản để tiếp tục.
            </DialogDescription>
          </div>
          <div className={cn(step === STEPS.REGISTER && "hidden")}>
            Xác thực email bằng OTP
          </div>
        </DialogTitle>
        <div
          className={`${step === STEPS.REGISTER ? "" : "-translate-x-[304px]"} flex w-[584px] gap-6 transition-all duration-200 ease-in-out`}
        >
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-[280px] flex-col gap-4"
            >
              <FormTextInput
                label="Họ"
                placeholder="Nhập họ của bạn"
                name="lastName"
                type="text"
                isRequired
                autoFocus
                radius="sm"
              />
              <FormTextInput
                label="Tên"
                placeholder="Nhập tên của bạn"
                name="firstName"
                type="text"
                isRequired
                radius="sm"
              />
              <FormTextInput
                label="Email"
                placeholder="Nhập email của bạn"
                name="email"
                type="text"
                isRequired
                radius="sm"
              />

              <FormPhoneInput
                name={phoneName}
                label="Số điện thoại"
                options={countries}
                isRequired={true}
                placeholder="Nhập số điện thoại"
                defaultValues={defaultPhoneValue}
                classNames={classNames}
              />

              <div className="flex items-center gap-2 rounded-md border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 p-2 text-sm text-amber-800">
                <BsExclamationCircle className="flex-none" />
                <p className="font-semibold text-amber-800">
                  Lưu ý:{" "}
                  <span className="ml-1 font-normal text-amber-800">
                    Nhập CCCD chỉ dành cho người Việt Nam
                  </span>
                </p>
              </div>

              <FormTextInput
                label="CCCD"
                placeholder="Nhập CCCD"
                name="social_id"
                type="text"
                radius="sm"
              />

              <div className="flex flex-col">
                <Button
                  id="btn-sign-up"
                  type="submit"
                  className="flex flex-row items-center gap-2 px-6 py-2"
                  disabled={isLoading}
                >
                  {"Tạo tài khoản "}
                  <TbLoader2
                    className={cn(
                      "mr-2 h-4 w-4 animate-spin",
                      !isLoading && "hidden"
                    )}
                  />
                </Button>
                <div className="post-detail self-end !text-sm font-semibold">
                  Đã có tài khoản?{" "}
                  <Button
                    onClick={onOpenSignIn}
                    type="button"
                    variant={"link"}
                    className="inline !p-0 font-bold"
                  >
                    <a className="!cursor-pointer text-primary">Đăng nhập</a>
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
          {step === STEPS.OTP && (
            <div className="flex w-[280px]">
              <OTPForm
                handlePrevStep={handlePreviousStep}
                emailValue={emailValue}
                className={className}
                isResendOTP={true}
                handleVerified={handleVerified}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(QuickSignUpModal);
