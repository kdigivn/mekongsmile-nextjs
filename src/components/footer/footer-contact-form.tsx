"use client";

import React, { memo, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/services/i18n/client";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCreateContact } from "@/services/apis/third-parties/lead";
import { toast } from "sonner";
import PassengerFormTextInput from "@/components/form-elements/text-input/passenger-form-text-input";

import { TiPhoneOutline } from "react-icons/ti";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

function FooterContactForm() {
  const { t } = useTranslation("post/contact-form");
  const [showNameField, setShowNameField] = useState(false);
  const inputClassNames = useMemo(
    () => ({
      base: "w-full flex flex-col gap-1.5",
      input:
        "!mt-0 w-full min-h-7 border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black md:text-sm rounded-lg bg-white text-base font-normal",
      label: "font-medium md:text-sm text-xs",
    }),
    []
  );

  const pathname = usePathname();

  const contactSchema = yup
    .object({
      fullName: yup.string().required(),
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
          fullName: "Vô danh",
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
      if (!showNameField) {
        setShowNameField(true);
        return;
      }
      const formValidate = await contactSchema.validate(formData, {
        abortEarly: false,
      });
      const source_url = `${process.env.NEXT_PUBLIC_BASE_URL}${pathname}`;
      try {
        const response = await createContact({
          ...formValidate,
          source_url: source_url,
          source_title: "Footer Contact Form",
        });
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

  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          "flex items-center gap-2 transition-all duration-300",
          showNameField && "flex-col"
        )}
      >
        <PassengerFormTextInput
          name="phone"
          label={t("contact-form.phone.label")}
          placeholder={"Để lại số điện thoại/Zalo"}
          isRequired
          classNames={inputClassNames}
          defaultValue=""
        />
        <AnimatePresence>
          {showNameField && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className="relative">
                <PassengerFormTextInput
                  name="fullName"
                  label={"Họ và tên"}
                  placeholder={"Để lại tên của bạn"}
                  isRequired
                  classNames={inputClassNames}
                  defaultValue=""
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              id="footer-contact-form-btn"
              type="submit"
              className={cn(
                "none flex flex-none content-end items-center gap-2 px-6",
                showNameField && "w-full content-start self-start"
              )}
              aria-label="Submit phone number or zalo"
            >
              <TiPhoneOutline className="h-5 w-5 flex-none" />
              {` ${showNameField ? "Yêu cầu tư vấn" : ""}`}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Yêu cầu gọi lại tư vấn</TooltipContent>
        </Tooltip>
      </form>
    </FormProvider>
  );
}

export default memo(FooterContactForm);
