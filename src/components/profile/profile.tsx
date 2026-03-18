"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { User } from "@/services/apis/users/types/user";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@heroui/react";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { useCustomerPatchProfileMutation } from "@/services/apis/customers/customers.service";
import FormTextInput from "../form-elements/text-input/form-text-input";
import { FileEntity } from "@/services/apis/files/types/file-entity";
import { useFilePostMutation } from "@/services/apis/files/files.service";
import useConfirmDialog from "../confirm-dialog/use-confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import FormPhoneInput from "../form-elements/text-input/form-phone-input";
import { countries, processPhoneNumber } from "@/lib/countries";
import { BsExclamationCircle } from "react-icons/bs";
import LinkBase from "../link-base";
import { MdOutlineOpenInNew } from "react-icons/md";
import {
  TooltipResponsive,
  TooltipResponsiveTrigger,
  TooltipResponsiveContent,
} from "../tooltip-responsive";

type Props = {
  user: User;
  language: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setIsChangePasswordOpen: (isOpen: boolean) => void;
};

type EditProfileBasicInfoFormData = {
  first_name: string;
  last_name: string;
  photo?: FileEntity;
  phone: string;
  phone_country_code: string;
  social_id?: string | null;
};

const useValidationBasicInfoSchema = () => {
  const { t } = useTranslation("profile");

  return yup.object().shape({
    first_name: yup
      .string()
      .required(t("profile:inputs.firstName.validation.required")),
    last_name: yup
      .string()
      .required(t("profile:inputs.lastName.validation.required")),
    phone: yup.string().required(t("profile:inputs.phone.validation.required")),
    phone_country_code: yup
      .string()
      .required(t("profile:inputs.phone.validation.required")),
    social_id: yup
      .string()
      .trim()
      .nullable()
      .matches(
        /^(|\d{12})$/,
        t("profile:inputs.socialId.validation.invalid-length")
      ),
  });
};

function Profile({
  user,
  language,
  isOpen,
  setIsOpen,
  setIsChangePasswordOpen,
}: Props) {
  const { t } = useTranslation("profile");
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = useValidationBasicInfoSchema();
  const { patchCustomerAsync, patchCustomerSuccess } =
    useCustomerPatchProfileMutation();
  const { confirmDialog } = useConfirmDialog();

  const { postFileAsync } = useFilePostMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // const { setUser } = useAuthActions();

  const formMethods = useForm<EditProfileBasicInfoFormData>(
    useMemo(
      () => ({
        resolver: yupResolver(validationSchema),
        defaultValues: {
          first_name: "",
          last_name: "",
          photo: undefined,
          phone: "",
          phone_country_code: "",
          social_id: "",
        },
      }),
      [validationSchema]
    )
  );

  const { handleSubmit, reset, setValue, getValues } = formMethods;

  const inputClassNames = useMemo(
    () => ({
      input: "h-full",
      label:
        "!group-data-[filled-within=true]:-translate-y-[calc(80% + theme(fontSize.small)/2 - 6px - theme(borderWidth.medium))] group-data-[filled-within=true]:top-[-.1rem] bg-white group-data-[filled-within=true]:text-black group-data-[filled-within=true]:font-semibold !px-1",
    }),
    []
  );

  const resetForm = useCallback(() => {
    reset({
      first_name: user?.customer?.first_name ?? "",
      last_name: user?.customer?.last_name ?? "",
      photo: undefined,
      phone: user?.customer?.phone ?? "",
      phone_country_code: user?.customer?.phone_country_code ?? "VN",
      social_id: user?.customer?.social_id ?? "",
    });
    setPreviewUrl(null);
    setPhoto(null);
  }, [
    reset,
    user?.customer?.first_name,
    user?.customer?.last_name,
    user?.customer?.phone,
    user?.customer?.phone_country_code,
    user?.customer?.social_id,
  ]);

  const onSubmit = async (formData: EditProfileBasicInfoFormData) => {
    setIsLoading(true);
    try {
      if (photo) {
        const data = await postFileAsync(photo);
        if (data?.file) {
          formData.photo = data.file;
          // toast.success(t("profile:inputs.avatar.success"));
        }
      }
      await patchCustomerAsync(formData);
      toast.success(t("profile:alerts.profile.success"));
    } catch (error) {
      console.error("Error", error);
      toast.error(t("profile:alerts.profile.error"));
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (patchCustomerSuccess) {
      resetForm();
      setIsOpen(false);
    }
  }, [patchCustomerSuccess, resetForm, setIsOpen, t]);

  useEffect(() => {
    reset({
      first_name: user?.customer?.first_name ?? "",
      last_name: user?.customer?.last_name ?? "",
      photo: undefined,
    });
    setPreviewUrl(null);
    setPhoto(null);
  }, [reset, user.customer?.first_name, user.customer?.last_name]);

  const handleImport = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }, []);
  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("profile:inputs.avatar.validation.max"));
      event.target.value = "";
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const mockFileEntity: FileEntity = {
      id: "temp-id",
      path: url,
    };

    setPhoto(file);
    setValue("photo", mockFileEntity);
  };

  const showConfirmation = useCallback(async () => {
    const currentValues = getValues();
    const hasChanges =
      currentValues.first_name !== user.customer?.first_name ||
      currentValues.last_name !== user.customer?.last_name ||
      (currentValues.photo && currentValues.photo !== null);

    if (hasChanges) {
      const userConfirmed = await confirmDialog({
        title: t("alerts.quit.title"),
        message: t("alerts.quit.message"),
        successButtonText: t("alerts.quit.yes"),
        cancelButtonText: t("alerts.quit.back"),
      });
      if (userConfirmed) {
        return true;
      }
    } else {
      return true;
    }
    return false;
  }, [
    confirmDialog,
    getValues,
    t,
    user.customer?.first_name,
    user.customer?.last_name,
  ]);

  const onChangePassword = useCallback(async () => {
    const userConfirmed = await showConfirmation();
    if (userConfirmed) {
      resetForm();
      setIsOpen(false);
      setIsChangePasswordOpen(true);
    }
  }, [resetForm, setIsChangePasswordOpen, setIsOpen, showConfirmation]);

  const onClose = useCallback(async () => {
    const userConfirmed = await showConfirmation();
    if (userConfirmed) {
      resetForm();
      setIsOpen(false);
    }
  }, [resetForm, setIsOpen, showConfirmation]);

  const defaultValues = useMemo(
    () => ({
      countryCode: user.customer?.phone_country_code || "VN",
      phoneNumber: processPhoneNumber(
        user.customer?.phone as string,
        user.customer?.phone_country_code || "VN"
      ),
    }),
    [user.customer?.phone, user.customer?.phone_country_code]
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
      label: "top-full font-medium md:!text-sm !text-sm !text-black",
      countryCodeTrigger:
        "!mt-0 h-14 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black w-full md:text-sm rounded-tr-none rounded-br-none",
      baseCountryCode: "flex flex-col gap-1 space-y-1 w-[80px] flex-none",
      labelCountryCode: "leading-5 text-xs",
      wrapper: "w-full flex flex-row items-center",
      wrapperErrorMessage: "w-full flex flex-row items-center",
    }),
    []
  );

  const endContent = useMemo(() => {
    return (
      <TooltipResponsive>
        <TooltipResponsiveTrigger asChild>
          <Button variant="ghost" size="sm" className="mb-1 h-auto p-1">
            <BsExclamationCircle className="h-5 w-5" />
          </Button>
        </TooltipResponsiveTrigger>
        <TooltipResponsiveContent className="flex items-center justify-center">
          Để xuất hóa đơn theo nghị định 70/2025/NĐ-CP{" "}
          <LinkBase
            href={
              "https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Nghi-dinh-70-2025-ND-CP-sua-doi-Nghi-dinh-123-2020-ND-CP-hoa-don-chung-tu-577816.aspx?anchor=dieu_1"
            }
            target="_blank"
            className="inline-block h-[14px]"
          >
            <MdOutlineOpenInNew className="h-4 w-4" />
          </LinkBase>
        </TooltipResponsiveContent>
      </TooltipResponsive>
    );
  }, []);

  const fullName =
    language === "en"
      ? `${user?.customer?.first_name || ""}${user?.customer?.last_name ? (user?.customer?.first_name ? " " : "") + user?.customer?.last_name : ""}`
      : `${user?.customer?.last_name || ""}${user?.customer?.first_name ? (user?.customer?.last_name ? " " : "") + user?.customer?.first_name : ""}`;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isLoading ? (
        <DialogContent className="!flex h-[448px] w-11/12 max-w-xl flex-col items-center justify-center rounded-md p-4 align-middle">
          <Spinner size="lg" />
        </DialogContent>
      ) : (
        <DialogContent
          className={`!flex max-h-[90vh] w-[90vw] max-w-screen-sm flex-col gap-2 overflow-y-auto rounded-md p-4 transition-all duration-200 ease-soft-spring`}
          closeIconClassName="h-4 w-4"
          closeButtonClassName="absolute right-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground flex items-center justify-center border-none hover:border-2 h-9 w-9 p-2 rounded-md hover:border-primary bg-default-200 top-auto"
        >
          <DialogTitle className="h-9 content-center text-base font-bold">
            {t("title1")}
          </DialogTitle>

          <DialogHeader className="relative block h-fit w-full">
            <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-md bg-default-200 p-4">
              <div className="flex items-center justify-center gap-2">
                {/* <Avatar
                  onClick={handleImport}
                  alt={
                    language === "en"
                      ? (user.customer?.last_name ?? "")
                      : (user.customer?.first_name ?? "")
                  }
                  src={previewUrl ?? user.customer?.photo?.path ?? ""}
                  size="lg"
                  className="flex aspect-square h-16 w-16 items-center justify-center rounded-s-full bg-default-200 text-base font-semibold transition-transform"
                /> */}
                <Avatar className="flex h-16 w-16 flex-col items-center justify-center overflow-hidden rounded-full text-3xl">
                  <AvatarImage
                    src={previewUrl ?? user.customer?.photo?.path ?? ""}
                    className="h-full w-full bg-white object-cover"
                  />
                  <AvatarFallback className="bg-primary text-white">
                    {`${user.customer?.last_name?.[0] || ""}${
                      user.customer?.first_name?.[0] || ""
                    }`}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-sm font-semibold">{fullName}</span>{" "}
                  <span className="text-sm text-default-500">{user.email}</span>
                  <span className="text-sm text-default-500">
                    {t("balance")}
                    {`${formatCurrency(user.customer?.balance || 0)}`}
                  </span>
                </div>
              </div>
              <Button
                className="bg-info-500 text-sm shadow-none"
                onClick={handleImport}
              >
                {t("inputs.avatar.edit")}
              </Button>
            </div>
          </DialogHeader>
          <FormProvider {...formMethods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full flex-col gap-4"
            >
              <FormTextInput
                name="last_name"
                label={t("inputs.lastName.label")}
                isRequired
                defaultValue={user.customer?.last_name ?? ""}
                classNames={inputClassNames}
              />
              <FormTextInput
                name="first_name"
                label={t("inputs.firstName.label")}
                isRequired
                defaultValue={user.customer?.first_name ?? ""}
                classNames={inputClassNames}
              />
              <FormPhoneInput
                name={phoneName}
                label="Số điện thoại"
                options={countries}
                isRequired={true}
                placeholder="Nhập số điện thoại"
                classNames={classNames}
                defaultValues={defaultValues}
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
                type="text"
                name="social_id"
                label="CCCD"
                defaultValue={user.customer?.social_id ?? ""}
                classNames={inputClassNames}
                endContent={endContent}
              />
              <input
                className="hidden"
                name="photo"
                ref={fileInputRef}
                type="file"
                id="import-file"
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
              />
              <Button
                className="w-fit self-end"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? t("inputs.avatar.pending") : t("actions.submit")}
              </Button>
            </form>
          </FormProvider>
          <div className="text-sm font-bold">{t("title3")}</div>
          <Button
            className="w-fit self-start bg-danger-500"
            onClick={onChangePassword}
          >
            {t("title2")}
          </Button>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default memo(Profile);
