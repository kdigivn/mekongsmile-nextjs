"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FiLogIn, FiPhoneCall } from "react-icons/fi";
import { Link } from "@heroui/react";
import { cn } from "@/lib/utils";
import { useMobileBottomNav } from "./use-mobile-bottom-nav";
import { TbMapPinSearch } from "react-icons/tb";
import LinkBase from "@/components/link-base";
import { HiOutlineTicket } from "react-icons/hi";
import useAuth from "@/services/auth/use-auth";
import { usePathname } from "next/navigation";
import { LuShoppingCart } from "react-icons/lu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMobileBottomNavActions } from "./use-mobile-bottom-nav-actions";
import { Button } from "@/components/ui/button";
import PassengerFormTextInput from "@/components/form-elements/text-input/passenger-form-text-input";
import { TiPhoneOutline } from "react-icons/ti";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "@/services/i18n/client";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCreateContact } from "@/services/apis/third-parties/lead";
import { toast } from "sonner";

const FooterMobileContactButtons = () => {
  const { isNavVisible } = useMobileBottomNav();
  const { hideNav, showNav } = useMobileBottomNavActions();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [returnPath, setReturnPath] = useState(pathname);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  const isProduct = useMemo(() => pathname.includes("/product"), [pathname]);

  const openDrawer = useCallback(() => {
    setIsContactFormOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsContactFormOpen(false);
  }, []);

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
        setIsContactFormOpen(false);
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
    // Check if window is defined (client-side)
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(
        window.location.search
      ).toString();
      const fullPath = searchParams ? `${pathname}?${searchParams}` : pathname;
      setReturnPath(encodeURIComponent(fullPath));
    }
  }, [pathname]);

  useEffect(() => {
    if (isContactFormOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isContactFormOpen, showNav]);

  return (
    <div
      className={cn(
        "ct-shortcuts-container desktop-hidden bottom-0 left-0 m-0 !h-14 !w-full px-5 transition-all duration-200",
        !isNavVisible && "translate-y-24"
      )}
      data-type="type-2"
      data-behavior="scroll"
    >
      <Link
        href="/schedules/22-soc-trang-con-dao/"
        data-shortcut="custom_link"
        data-label="bottom"
        aria-label="Find trip"
        className="ct-hidden-lg"
      >
        <span className="ct-label">Tìm chuyến</span>
        <span className="ct-icon-container">
          <TbMapPinSearch className="text-2xl" />
        </span>
      </Link>

      {isProduct && (
        <FormProvider {...formMethods}>
          <Drawer
            open={isContactFormOpen}
            onOpenChange={setIsContactFormOpen}
            onClose={closeDrawer}
            modal={false}
          >
            <DrawerTrigger asChild>
              <button
                data-shortcut="custom_link"
                data-label="bottom"
                aria-label="Đặt ngay"
                className="ct-hidden-lg"
                onClick={openDrawer}
              >
                <span className="ct-label">Đặt ngay</span>
                <span className="ct-icon-container">
                  <LuShoppingCart className="text-2xl" />
                </span>
              </button>
            </DrawerTrigger>

            <DrawerContent className="!flex h-full flex-col rounded-none p-5 transition-all duration-200 ease-soft-spring md:p-10 lg:!hidden lg:rounded-lg">
              <DrawerHeader>
                <DrawerTitle>Đặt ngay với ưu đãi tốt</DrawerTitle>
                <DrawerDescription>
                  Để lại thông tin, chúng tôi sẽ liên hệ với bạn ngay sau 5
                  phút.
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
                  variant="default"
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  className="flex w-full flex-row gap-2"
                >
                  <TiPhoneOutline className="h-5 w-5 flex-none" />
                  Yêu cầu tư vấn
                </Button>
                <DrawerClose asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={closeDrawer}
                  >
                    Đóng
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </FormProvider>
      )}

      {isAuthenticated ? (
        <LinkBase
          href={"/user/bookings/"}
          data-shortcut="custom_link"
          data-label="bottom"
          aria-label="Đơn hàng"
        >
          <span className="ct-label">Vé của tôi</span>
          <span className="ct-icon-container">
            <HiOutlineTicket className="text-2xl" />
          </span>
        </LinkBase>
      ) : (
        <LinkBase
          href={`/sign-in?returnTo=${returnPath}`}
          data-shortcut="custom_link"
          data-label="bottom"
          aria-label="Đăng nhập"
        >
          <span className="ct-label">Đăng nhập</span>
          <span className="ct-icon-container">
            <FiLogIn className="text-2xl" />
          </span>
        </LinkBase>
      )}
      <Link
        href="tel:0924299898"
        data-shortcut="phone"
        data-label="bottom"
        aria-label="Hotline"
        className="ct-hidden-lg"
      >
        <span className="ct-label">Liên hệ</span>
        <span className="ct-icon-container">
          <FiPhoneCall />
        </span>
      </Link>
      {/* <LiveChatLink type="link" /> */}
      {/* <Link
        href="https://s.ncmk.me/f1"
        target="_blank"
        rel="nofollow"
        data-shortcut="custom_link"
        data-label="bottom"
        aria-label="Facebook"
      >
        <span className="ct-label">Facebook</span>
        <span className="ct-icon-container">
          <i className="icon-facebook"></i>
          <Image
            src="/static-img/Facebook_Logo.webp"
            alt="Liên hệ qua Facebook"
            width={24}
            height={24}
            className="!h-6 !w-6"
          />
        </span>
      </Link> */}
      {/* <Link
        href="https://s.ncmk.me/zalo"
        target="_blank"
        rel="nofollow"
        data-shortcut="custom_link"
        data-label="bottom"
        aria-label="ZaloOA"
      >
        <span className="ct-label">ZaloOA</span>
        <span className="ct-icon-container">
          <div className="zalo-icon-circle">
            <span className="zalo-label">Zalo</span>
          </div>
        </span>
      </Link> */}
    </div>
  );
};

export default memo(FooterMobileContactButtons);
