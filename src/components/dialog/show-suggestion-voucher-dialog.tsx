"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer";
import { memo, useMemo, useCallback, useEffect, ReactNode } from "react";
import { useMobileBottomNav } from "../footer/footer-mobile-contact-buttons/use-mobile-bottom-nav";
import { useMobileBottomNavActions } from "../footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
// import { useTranslation } from "react-i18next";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useMediaQuery } from "@/hooks/use-media-query";
import { IoIosHelpCircleOutline, IoIosLink } from "react-icons/io";
import {
  IoAlertCircleOutline,
  IoCheckmark,
  IoGiftOutline,
} from "react-icons/io5";
import { RiDiscountPercentLine } from "react-icons/ri";
import { Button } from "../ui/button";
import { FiBookOpen } from "react-icons/fi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

interface VoucherInfoItem {
  id: string;
  title: string;
  content: string;
  icon: ReactNode;
  iconBgColor: string;
  iconTextColor: string;
}

interface VoucherInfoAccordionProps {
  items: VoucherInfoItem[];
  defaultOpenItems?: string[];
  className?: string;
}

const VoucherInfoAccordion = ({
  items,
  defaultOpenItems = [],
  className = "w-full",
}: VoucherInfoAccordionProps) => {
  return (
    <Accordion
      defaultValue={defaultOpenItems}
      className={className}
      type="multiple"
    >
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="rounded-md !border-0 !bg-gray-50 px-4 py-1"
        >
          <AccordionTrigger className="flex w-full items-center gap-2 text-left hover:no-underline">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 ${item.iconBgColor} ${item.iconTextColor}`}
              >
                {item.icon}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {item.title}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <p className="text-xs leading-relaxed text-gray-600">
              {item.content}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

const ShowSuggestionVoucherDialog = ({
  displayVoucherSuggestion,
}: {
  displayVoucherSuggestion: boolean;
}) => {
  const { hideNav, showNav, hideVoucher, showVoucher, hideForm } =
    useMobileBottomNavActions();
  const { isShowVoucherForm } = useMobileBottomNav();
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  useEffect(() => {
    if (isShowVoucherForm) {
      hideNav();
      hideForm();
    } else {
      showNav();
    }
  }, [hideNav, hideForm, showNav, isShowVoucherForm]);

  //   const { t } = useTranslation("post/contact-form");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!displayVoucherSuggestion) return;

    const hasSeenVoucher = localStorage.getItem("hasSeenVoucher");

    if (hasSeenVoucher !== "true") {
      const timer = setTimeout(() => {
        showVoucher();
      }, 90000); // 90 seconds for first time

      return () => clearTimeout(timer);
    }
  }, [displayVoucherSuggestion, showVoucher]);

  const handleCloseVoucher = useCallback(() => {
    localStorage.setItem("hasSeenVoucher", "true");
    hideVoucher();
  }, [hideVoucher]);

  // Memoized voucher info data
  const voucherInfoItems = useMemo(
    () => [
      {
        id: "why-discount",
        title: "Vì sao giảm giá ít vậy?",
        content:
          "Chúng tôi cũng muốn tung chương trình giảm giá sâu, tuy nhiên mỗi vé bán ra chúng tôi chỉ lãi từ 5,000đ - 20,000đ",
        icon: <IoIosHelpCircleOutline className="h-3 w-3" />,
        iconBgColor: "",
        iconTextColor: "",
      },
      {
        id: "usage-guide",
        title: "Hướng dẫn sử dụng",
        content:
          "Bạn có thể sử dụng mã giảm giá này ở bước Chọn ghế và nhập thông tin hành khách.",
        icon: <FiBookOpen className="h-3 w-3" />,
        iconBgColor: "",
        iconTextColor: "",
      },
      {
        id: "terms-conditions",
        title: "Điều kiện áp dụng",
        content:
          "Chỉ áp dụng cho các tuyến sau: Trần Đề - Côn Đảo, Côn Đảo - Trần Đề, TP.HCM - Côn Đảo, Côn Đảo - TP.HCM.",
        icon: <IoAlertCircleOutline className="h-3 w-3" />,
        iconBgColor: "",
        iconTextColor: "",
      },
    ],
    []
  );

  const openAccordion = useMemo(() => [], []);

  const VoucherContent = () => (
    <>
      {/* Voucher Card */}
      <div className="relative mx-auto w-full overflow-auto rounded-2xl">
        <div className="rounded-2xl bg-white p-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-400">
              <IoGiftOutline className="h-8 w-8 text-white" />
            </div>

            <h3 className="mb-2 text-xl font-bold text-gray-800">
              Thân tặng quý khách
            </h3>

            <div className="mb-4 flex items-center justify-center gap-2">
              <RiDiscountPercentLine className="h-6 w-6 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">
                Mã giảm giá 10,000đ
              </span>
            </div>

            {/* Voucher Code */}
            <div className="mb-4 rounded-lg border-2 border-dashed border-orange-300 bg-orange-50 p-4">
              <div className="flex items-center justify-between">
                <span className="flex-1 text-center font-mono text-lg font-bold text-orange-700">
                  XINCHAO
                </span>
                <button
                  onClick={() => {
                    copyToClipboard("XINCHAO");
                  }}
                  className="grayscale transition-all duration-200 ease-in-out hover:grayscale-0"
                  aria-label="Copy voucher code"
                >
                  {isCopied ? (
                    <IoCheckmark className="h-4 w-4" />
                  ) : (
                    <IoIosLink className="h-4 w-4" />
                  )}
                  <div className="w-full flex-1 rounded-md bg-[--bg] md:rounded-lg" />
                </button>
              </div>
            </div>

            {/* Explanation */}

            <VoucherInfoAccordion
              items={voucherInfoItems}
              defaultOpenItems={openAccordion}
              className="flex flex-col gap-2"
            />
          </div>
        </div>
      </div>
    </>
  );

  return isDesktop ? (
    <Dialog open={isShowVoucherForm} onOpenChange={handleCloseVoucher}>
      <DialogContent
        className={`!hidden max-w-md flex-col rounded-lg p-5 transition-all duration-200 ease-soft-spring md:p-10 lg:!flex`}
        closeIconClassName="h-4 w-4"
        closeButtonClassName="border-2 border-default-100 p-1 rounded-md right-2 hover:border-primary"
      >
        <VoucherContent />

        <DialogFooter className="hidden items-center justify-center lg:flex">
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={handleCloseVoucher}
              className="w-full"
            >
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={isShowVoucherForm} onClose={handleCloseVoucher} modal={false}>
      <DrawerContent className="!flex h-full flex-col rounded-none p-5 transition-all duration-200 ease-soft-spring md:p-10 lg:!hidden lg:rounded-lg">
        <VoucherContent />

        <DrawerFooter>
          <DrawerClose asChild>
            <Button
              variant="outline"
              onClick={handleCloseVoucher}
              className="w-full"
            >
              Đóng
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default memo(ShowSuggestionVoucherDialog);
