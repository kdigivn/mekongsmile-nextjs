"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { memo, useEffect, useMemo } from "react";
import { useMobileBottomNavActions } from "../footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { useMobileBottomNav } from "../footer/footer-mobile-contact-buttons/use-mobile-bottom-nav";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { useCreateContact } from "@/services/apis/third-parties/lead";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import PassengerFormTextInput from "../form-elements/text-input/passenger-form-text-input";
import { Button } from "../ui/button";
import { TiPhoneOutline } from "react-icons/ti";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";

const SupportContactForm = () => {
  const { hideNav, showNav, hideForm, showForm } = useMobileBottomNavActions();
  const pathname = usePathname();
  const { isShowSupportForm } = useMobileBottomNav();
  useEffect(() => {
    if (isShowSupportForm) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isShowSupportForm, showNav]);

  const { t } = useTranslation("post/contact-form");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const inputClassNames = useMemo(
    () => ({
      base: "col-span-12 md:col-span-5 flex flex-col gap-1.5",
      input:
        "!mt-0 w-full min-h-7 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black md:text-sm",
      label: "font-medium md:text-sm text-xs",
    }),
    []
  );

  const contactSchema = yup
    .object({
      fullName: yup
        .string()
        .required(t("contact-form.name.validation.required")),
      phone: yup
        .string()
        .required(t("contact-form.phone.validation.required"))
        .matches(/^[0-9]{9,11}$/, t("contact-form.phone.validation.notValid")),
    })
    .required();

  type FormData = yup.InferType<typeof contactSchema>;

  const formMethods = useForm(
    useMemo(
      () => ({
        defaultValues: {
          fullName: "",
          phone: "",
        },
        resolver: yupResolver(contactSchema),
      }),
      [contactSchema]
    )
  );

  const createContact = useCreateContact();

  const { handleSubmit, reset } = formMethods;
  async function onSubmit(formData: FormData) {
    try {
      const formValidate = await contactSchema.validate(formData, {
        abortEarly: false,
      });
      const source_url = `${process.env.NEXT_PUBLIC_BASE_URL}/${pathname}/`;
      try {
        const response = await createContact({
          ...formValidate,
          source_url: source_url,
          source_title: "Thanh điều hướng dưới cùng",
        });
        hideForm();
        if (response.ok) {
          toast.success(t("contact-form.sendForm.success"));
          reset();
        } else {
          toast.error(t("contact-form.sendForm.error"));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
        }
        toast.error(t("contact-form.sendForm.error"));
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return;
      }
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isFirstTime = localStorage.getItem("isFirstTime") === "true";
    if (!isFirstTime) {
      setTimeout(() => {
        showForm();
        localStorage.setItem("isFirstTime", "true");
      }, 60000);
    }
  }, [showForm]);

  return isDesktop ? (
    <FormProvider {...formMethods}>
      <Dialog open={isShowSupportForm} onOpenChange={hideForm}>
        <DialogContent
          className={`!hidden max-w-md flex-col rounded-lg p-5 transition-all duration-200 ease-soft-spring md:p-10 lg:!flex`}
          closeIconClassName="h-4 w-4"
          closeButtonClassName="border-2 border-default-100 p-1 rounded-md right-2 hover:border-primary"
        >
          <DialogHeader className="relative block h-fit w-full space-y-0">
            <DialogTitle>Bạn có cần nhân viên hỗ trợ không?</DialogTitle>
            <DialogDescription>
              Để lại thông tin, chúng tôi sẽ liên hệ với bạn ngay sau 5 phút.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-3"
          >
            <PassengerFormTextInput
              name="fullName"
              label={t("contact-form.name.label")}
              placeholder={t("contact-form.name.placeholder")}
              isRequired
              classNames={inputClassNames}
              defaultValue=""
            />
            <PassengerFormTextInput
              name="phone"
              label={t("contact-form.phone.label")}
              placeholder={t("contact-form.phone.placeholder")}
              isRequired
              classNames={inputClassNames}
              defaultValue=""
            />
          </form>
          <DialogFooter className="hidden items-center justify-center lg:flex">
            <DialogClose asChild>
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={hideForm}
              >
                Tôi tự thao tác
              </Button>
            </DialogClose>
            <Button
              id="btn-support-contact"
              variant="default"
              type="submit"
              onClick={handleSubmit(onSubmit)}
              className="flex w-full flex-row gap-2"
            >
              <TiPhoneOutline className="h-5 w-5 flex-none" />
              Hãy hỗ trợ tôi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  ) : (
    <FormProvider {...formMethods}>
      <Drawer open={isShowSupportForm} onClose={hideForm} modal={false}>
        <DrawerContent className="!flex h-full flex-col rounded-none p-5 transition-all duration-200 ease-soft-spring md:p-10 lg:!hidden lg:rounded-lg">
          <DrawerHeader>
            <DrawerTitle>Bạn có cần nhân viên hỗ trợ không?</DrawerTitle>
            <DrawerDescription>
              Để lại thông tin, chúng tôi sẽ liên hệ với bạn ngay sau 5 phút.
            </DrawerDescription>
          </DrawerHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-3"
          >
            <PassengerFormTextInput
              name="fullName"
              label={t("contact-form.name.label")}
              placeholder={t("contact-form.name.placeholder")}
              isRequired
              classNames={inputClassNames}
              defaultValue=""
            />
            <PassengerFormTextInput
              name="phone"
              label={t("contact-form.phone.label")}
              placeholder={t("contact-form.phone.placeholder")}
              isRequired
              classNames={inputClassNames}
              defaultValue=""
            />
          </form>
          <DrawerFooter>
            <Button
              id="btn-support-contact"
              variant="default"
              type="submit"
              onClick={handleSubmit(onSubmit)}
              className="flex w-full flex-row gap-2"
            >
              <TiPhoneOutline className="h-5 w-5 flex-none" />
              Hãy hỗ trợ tôi
            </Button>
            <DrawerClose asChild>
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={hideForm}
              >
                Tôi tự thao tác
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </FormProvider>
  );
};

export default memo(SupportContactForm);
