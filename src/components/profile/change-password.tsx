"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { memo, useCallback, useMemo, useState } from "react";
// import { useCheckDesktop } from "@/hooks/use-check-screen-type";
import { User } from "@/services/apis/users/types/user";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import useAuthActions from "@/services/auth/use-auth-actions";
import { toast } from "sonner";
import { useAuthPatchMeService } from "@/services/apis/auth/auth.service";
import FormTextInput from "../form-elements/text-input/form-text-input";
import { cn, Spinner } from "@heroui/react";
import useConfirmDialog from "../confirm-dialog/use-confirm-dialog";
import { MdDone } from "react-icons/md";
import { useRouter } from "next/navigation";

type Props = {
  user: User;
  language: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setIsChangeProfileOpen: (isOpen: boolean) => void;
};

type ChangPasswordFormData = {
  oldPassword: string;
  password: string;
  confirmPassword: string;
};

const useValidationChangPasswordSchema = () => {
  const { t } = useTranslation("profile");

  return yup.object().shape({
    oldPassword: yup
      .string()
      .required(t("profile:inputs.oldPassword.validation.required"))
      .min(6, t("profile:inputs.oldPassword.validation.min")),
    password: yup
      .string()
      .required(t("profile:inputs.password.validation.required"))
      .min(6, t("profile:inputs.password.validation.min"))
      .notOneOf(
        [yup.ref("oldPassword")],
        t("profile:inputs.password.validation.match")
      ),
    confirmPassword: yup
      .string()
      .required(t("profile:inputs.confirmPassword.validation.required"))
      .oneOf(
        [yup.ref("password")],
        t("profile:inputs.confirmPassword.validation.match")
      ),
  });
};

function ChangePassword({ isOpen, setIsOpen, setIsChangeProfileOpen }: Props) {
  const { t } = useTranslation("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const validationSchema = useValidationChangPasswordSchema();
  const { setUser } = useAuthActions();
  const fetchAuthPatchMe = useAuthPatchMeService();
  const { confirmDialog } = useConfirmDialog();

  const router = useRouter();

  const inputClassNames = useMemo(
    () => ({
      input: "h-full",
      label:
        "!group-data-[filled-within=true]:-translate-y-[calc(80% + theme(fontSize.small)/2 - 6px - theme(borderWidth.medium))] group-data-[filled-within=true]:top-[-.1rem] bg-white group-data-[filled-within=true]:text-black group-data-[filled-within=true]:font-semibold !px-1",
    }),
    []
  );

  // const cancelPasswordChange = useCallback(() => {
  //   setIsOpen(false);
  // }, [setIsOpen]);

  const formMethods = useForm<ChangPasswordFormData>(
    useMemo(
      () => ({
        resolver: yupResolver(validationSchema),
        defaultValues: {
          oldPassword: "",
          password: "",
          confirmPassword: "",
        },
      }),
      [validationSchema]
    )
  );

  const { handleSubmit, setError, getValues } = formMethods;

  const onSubmit = async (formData: ChangPasswordFormData) => {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const { oldPassword, password } = formData;
      const payload = {
        oldPassword,
        password,
      };
      const { data, status } = await fetchAuthPatchMe(payload);

      if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        setIsSuccess(false);
        (
          Object.keys(data.errors) as Array<keyof ChangPasswordFormData>
        ).forEach((key) => {
          setError(key, {
            type: "manual",
            message: t(
              `profile:inputs.${key}.validation.server.${data.errors[key]}`
            ),
          });
        });

        return;
      }

      if (status === HTTP_CODES_ENUM.OK) {
        setUser(data);
        resetForm();
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Error", error);
      toast.error(t("profile:inputs.avatar.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    formMethods.reset();
  }, [formMethods]);

  const setClose = useCallback(
    (isProfile: boolean = true) => {
      resetForm();
      setIsOpen(false);
      setIsChangeProfileOpen(isProfile);
    },
    [resetForm, setIsChangeProfileOpen, setIsOpen]
  );

  const onClose = useCallback(async () => {
    if (isOpen) {
      const currentValues = getValues();
      const hasChanges =
        currentValues.oldPassword !== "" ||
        currentValues.password !== "" ||
        currentValues.confirmPassword !== "";

      if (hasChanges) {
        const userConfirmed = await confirmDialog({
          title: t("alerts.quit.title"),
          message: t("alerts.quit.message"),
          successButtonText: t("alerts.quit.yes"),
          cancelButtonText: t("alerts.quit.back"),
        });
        if (userConfirmed) {
          setClose(true);
          setIsSuccess(false);
        }
      } else {
        setClose(true);
        setIsSuccess(false);
      }
    }
  }, [confirmDialog, getValues, isOpen, setClose, t]);

  const backHome = useCallback(() => {
    setClose(false);
    setIsSuccess(false);
    router.push("/");
  }, [router, setClose]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        {isLoading || isSuccess ? (
          <DialogContent className="!flex h-80 w-11/12 max-w-xl flex-col items-center justify-center rounded-md p-4 align-middle">
            {isLoading ? (
              <Spinner size="lg" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-evenly">
                <DialogTitle className="hidden">Success</DialogTitle>
                <div className="flex h-24 w-24 transform animate-appearance-in items-center justify-center rounded-full bg-success opacity-100 transition-all duration-1000 ease-out">
                  <MdDone className="h-20 w-20 text-white" />
                </div>
                <p className="text-xl font-bold">
                  {" "}
                  {t("profile:alerts.password.success")}
                </p>
                <DialogFooter>
                  <Button onClick={backHome}>Trang chủ</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        ) : (
          <DialogContent
            className={`!flex h-fit w-11/12 max-w-xl flex-col rounded-md p-4 transition-all duration-200 ease-soft-spring`}
            closeIconClassName="h-4 w-4"
            closeButtonClassName={
              isLoading
                ? "hidden"
                : cn(
                    "flex items-center justify-center border-none hover:border-2 h-9 w-9 p-2 rounded-md hover:border-primary bg-default-200 top-auto"
                  )
            }
          >
            <DialogTitle className="h-9 content-center text-base font-bold">
              {t("title2")}
            </DialogTitle>
            <FormProvider {...formMethods}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex w-full flex-col gap-4"
              >
                <FormTextInput
                  name="oldPassword"
                  label={t("inputs.oldPassword.label")}
                  isRequired
                  classNames={inputClassNames}
                  type="password"
                />
                <FormTextInput
                  name="password"
                  label={t("inputs.password.label")}
                  isRequired
                  classNames={inputClassNames}
                  type="password"
                />
                <FormTextInput
                  name="confirmPassword"
                  label={t("inputs.confirmPassword.label")}
                  isRequired
                  classNames={inputClassNames}
                  type="password"
                />
                <div className="flex gap-2 self-end">
                  <Button
                    className="w-fit bg-gray-300 text-black hover:bg-gray-500"
                    onClick={onClose}
                    type="button"
                  >
                    {t("actions.cancel")}
                  </Button>
                  <Button className="w-fit" type="submit">
                    {t("actions.submit")}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

export default memo(ChangePassword);
