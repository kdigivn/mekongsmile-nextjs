"use client";

import React, { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/services/i18n/client";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import { useCreateContact } from "@/services/apis/third-parties/lead";
import { toast } from "sonner";
import PassengerFormTextInput from "@/components/form-elements/text-input/passenger-form-text-input";
import { Product } from "@/services/infrastructure/wordpress/types/product";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TiPhoneOutline } from "react-icons/ti";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  post: Post | Product | null;
};
function ContactFormSection({ post }: Props) {
  const { t } = useTranslation("post/contact-form");
  const inputClassNames = useMemo(
    () => ({
      base: "col-span-12 md:col-span-5 flex flex-col gap-1.5",
      input:
        "!mt-0 w-full min-h-7 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black md:text-sm",
      label: "font-medium md:text-sm text-xs",
    }),
    []
  );

  const memorizedAccordionDefaultValue = useMemo(() => ["item-1"], []);

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
      const source_url = `${process.env.NEXT_PUBLIC_BASE_URL}/post/${post?.slug}`;
      try {
        const response = await createContact({
          ...formValidate,
          source_url: source_url,
          source_title: post?.title ?? "",
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
    <>
      {/* <div className="flex w-full flex-col gap-3 rounded-lg bg-white px-4 py-2">
        <HeadingBase wrapper="mx-2 mb-2">{t("heading")}</HeadingBase>

        <div className="flex h-full w-full flex-col gap-3">
          <FormProvider {...formMethods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex h-full w-full flex-col gap-3"
            >
              <div className="flex w-full flex-col  gap-4">
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
              </div>
              <Button type="submit" className=" w-full">
                <MdCall className="mr-2 h-5 w-5" />
                {t("callNow")}
              </Button>
            </form>
          </FormProvider>
        </div>
      </div> */}

      <Accordion
        type="multiple"
        defaultValue={memorizedAccordionDefaultValue}
        className="flex w-full flex-col gap-4"
      >
        <AccordionItem
          value="item-1"
          className="flex flex-col gap-2 rounded-lg border-none bg-white p-4"
        >
          <AccordionTrigger className="p-0 hover:no-underline">
            <div className="ite grid w-full grid-cols-12 gap-2">
              <div className="z-10 col-span-2 flex items-center justify-center">
                <TiPhoneOutline className="h-6 w-6" />
              </div>
              {/* <LinkBase
              href={sideBarItem.link ?? "#"}
              className="text-sm font-semibold"
            >
              {sideBarItem.label ?? t("invalid.label")}
            </LinkBase> */}
              <div className="col-span-10 w-fit text-sm font-semibold">
                {t("callNow")}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0">
            <FormProvider {...formMethods}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-12 gap-2 px-1 py-2"
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      id="btn-contact-form-submit"
                      type="submit"
                      className="col-span-12 w-full flex-none content-end items-center gap-2 px-6 md:col-span-2 md:col-start-11"
                      aria-label="Submit request consultation"
                    >
                      <TiPhoneOutline className="h-5 w-5 flex-none" />{" "}
                      <span className="md:hidden">{t("callNow")}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Yêu cầu gọi lại tư vấn</TooltipContent>
                </Tooltip>
              </form>
            </FormProvider>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}

export default memo(ContactFormSection);
