"use client";

import FormCheckboxInput from "@/components/form-elements/checkbox/form-checkbox-input";
import FormTextInput from "@/components/form-elements/text-input/form-text-input";
import { Button } from "@/components/ui/button";
import {
  useAuthLoginService,
  useAuthSignUpService,
} from "@/services/apis/auth/auth.service";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useTranslation } from "@/services/i18n/client";
import { isFacebookAuthEnabled } from "@/services/social-auth/facebook/facebook-config";
import { isGoogleAuthEnabled } from "@/services/social-auth/google/google-config";
import SocialAuth from "@/services/social-auth/social-auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { Spinner } from "@heroui/react";
import { useMemo } from "react";
import { FormProvider, useForm, useFormState } from "react-hook-form";
import * as yup from "yup";
import Image from "next/image";
import LinkBase from "@/components/link-base";
import { countries, getCountry } from "@/lib/countries";
import FormPhoneInput from "@/components/form-elements/text-input/form-phone-input";

type SignUpFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  social_id?: string | null;
  phone_country_code: string;
  termCheckBox: CheckboxType[];
};

type CheckboxType = {
  id: string;
  value: string;
};

const useValidationSchema = () => {
  const { t } = useTranslation("sign-up");

  return yup.object().shape({
    firstName: yup.string().required(t("inputs.firstName.validation.required")),
    lastName: yup.string().required(t("inputs.lastName.validation.required")),
    email: yup
      .string()
      .email(t("inputs.email.validation.invalid"))
      .required(t("inputs.email.validation.required")),
    password: yup
      .string()
      .min(6, t("inputs.password.validation.min"))
      .required(t("inputs.password.validation.required")),
    phone: yup
      .string()
      .max(20, "Phone number must be less than 20 characters")
      .required(t("inputs.phone.validation.required")),
    phone_country_code: yup
      .string()
      .required(t("inputs.phone.validation.required")),
    termCheckBox: yup
      .array()
      .required()
      .min(1, t("inputs.terms.validation.required")),
    social_id: yup
      .string()
      .trim()
      .nullable()
      .matches(/^(|\d{12})$/, t("inputs.socialId.validation.invalid-length")),
  });
};

function FormActions() {
  const { t } = useTranslation("sign-up");
  const { isSubmitting } = useFormState();

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="w-full rounded-md"
      id="btn-sign-up"
    >
      {isSubmitting && <Spinner color="white" size="sm" className="mr-1" />}
      {t("actions.submit")}
    </Button>
  );
}

function Form() {
  const { setTokensInfo } = useAuthTokens();
  const fetchAuthLogin = useAuthLoginService();
  const fetchAuthSignUp = useAuthSignUpService();
  const { t } = useTranslation("sign-up");
  const validationSchema = useValidationSchema();

  const methods = useForm(
    useMemo(
      () => ({
        resolver: yupResolver(validationSchema),
        defaultValues: {
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phone: "",
          phone_country_code: "VN",
          termCheckBox: [],
          social_id: "",
        },
      }),
      [validationSchema]
    )
  );

  const checkboxOption: CheckboxType[] = useMemo(
    () => [{ id: "1", value: t("inputs.terms.label") }],
    [t]
  );

  const { handleSubmit, setError } = methods;

  const onSubmit = async (formData: SignUpFormData) => {
    // Lấy thông tin quốc gia từ phone_country_code
    const countryInfo = getCountry(formData.phone_country_code);

    // Gán lại số điện thoại với mã quốc gia
    const phoneWithCountryCode = countryInfo?.phone
      ? `+${countryInfo.phone}${formData.phone}`
      : formData.phone;

    // Cập nhật picPhone
    const updatedFormData = {
      ...formData,
      phone: phoneWithCountryCode,
    };

    const { data: dataSignUp, status: statusSignUp } =
      await fetchAuthSignUp(updatedFormData);
    if (statusSignUp === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(dataSignUp.errors) as Array<keyof SignUpFormData>).forEach(
        (key) => {
          setError(key, {
            type: "manual",
            message: t(
              `sign-up:inputs.${key}.validation.server.${dataSignUp.errors[key]}`
            ),
          });
        }
      );

      return;
    }

    const { data: dataSignIn, status: statusSignIn } = await fetchAuthLogin({
      email: formData.email,
      password: formData.password,
    });

    if (statusSignIn === HTTP_CODES_ENUM.OK) {
      setTokensInfo({
        refreshToken: dataSignIn.refreshToken,
      });
    }
  };

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
      label: "top-full font-medium !text-sm md:!text-sm !text-black",
      countryCodeTrigger:
        "!mt-0 h-14 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black w-full md:text-sm rounded-tr-none rounded-br-none",
      baseCountryCode: "flex flex-col gap-1 space-y-1 w-[80px] flex-none",
      labelCountryCode: "leading-5 text-xs",
      wrapper: "w-full flex flex-row items-center",
      wrapperErrorMessage: "w-full flex flex-row items-center",
    }),
    []
  );

  return (
    <FormProvider {...methods}>
      <div className="mx-auto w-full lg:max-w-6xl">
        <div className="relative left-0 top-0 w-full">
          <div className="grid h-full w-full grid-cols-12 gap-6 p-4 md:relative">
            <div className="col-span-12 flex h-full w-full items-center justify-center rounded-md bg-white p-4 dark:bg-default-700 dark:bg-opacity-30 md:absolute md:bg-transparent md:dark:bg-transparent lg:relative lg:col-span-6 lg:bg-white lg:dark:bg-black">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex w-72 flex-none flex-col gap-4 md:w-[340px] md:rounded-lg md:bg-white md:bg-opacity-90 md:px-6 md:py-4 md:backdrop-blur-md md:dark:bg-black md:dark:bg-opacity-70 md:dark:backdrop-blur-md lg:w-72 lg:p-0"
              >
                <h2 className="text-center text-xl font-semibold">
                  {t("sign-up:welcome")}
                </h2>
                {[isGoogleAuthEnabled, isFacebookAuthEnabled].some(Boolean) && (
                  <>
                    <div className="flex flex-col overflow-hidden rounded-md border-1 border-primary">
                      <SocialAuth />
                    </div>
                    <p className="w-full text-center text-sm text-black dark:text-white">
                      {t("or")}
                    </p>
                  </>
                )}

                <div>
                  <FormTextInput
                    name="lastName"
                    label={t("inputs.lastName.label")}
                    placeholder={t("inputs.lastName.placeholder")}
                    type="text"
                    testId="lastName"
                    radius="sm"
                    isRequired
                  />
                </div>

                <div>
                  <FormTextInput
                    name="firstName"
                    label={t("inputs.firstName.label")}
                    placeholder={t("inputs.firstName.placeholder")}
                    type="text"
                    autoFocus
                    testId="firstName"
                    radius="sm"
                    isRequired
                  />
                </div>

                <div>
                  <FormTextInput
                    name="email"
                    label={t("inputs.email.label")}
                    placeholder={t("inputs.email.placeholder")}
                    type="email"
                    testId="email"
                    radius="sm"
                    isRequired
                  />
                </div>

                <div>
                  <FormTextInput
                    name="social_id"
                    label={t("inputs.socialId.label")}
                    placeholder={t("inputs.socialId.placeholder")}
                    type="text"
                    testId="social_id"
                    radius="sm"
                  />
                </div>

                <FormPhoneInput
                  name={phoneName}
                  label="Số điện thoại"
                  options={countries}
                  isRequired={true}
                  placeholder="Nhập số điện thoại"
                  classNames={classNames}
                />

                <div>
                  <FormTextInput
                    name="password"
                    label={t("inputs.password.label")}
                    placeholder={t("inputs.password.placeholder")}
                    type="password"
                    testId="password"
                    radius="sm"
                    isRequired
                  />
                </div>

                <div>
                  <FormCheckboxInput<CheckboxType>
                    name="termCheckBox"
                    options={checkboxOption}
                    keyValue={"value"}
                    size="sm"
                    // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                    keyExtractor={(option) => option.id}
                    // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                    renderOption={(option) => option.value}
                  />
                </div>

                <FormActions />
                <div className="flex flex-row justify-end">
                  <span className="flex gap-1">
                    {t("actions.accountAlreadyExists.ask")}
                    <LinkBase
                      href="/sign-in"
                      className="text-primary hover:underline"
                      aria-label="Login"
                    >
                      {t("actions.accountAlreadyExists.link")}
                    </LinkBase>
                  </span>
                </div>
              </form>
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
    </FormProvider>
  );
}

function SignUp() {
  return <Form />;
}

export default withPageRequiredGuest(SignUp);
