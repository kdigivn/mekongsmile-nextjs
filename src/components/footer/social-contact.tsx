"use client";

import { ContactRightside } from "@/services/infrastructure/wordpress/types/sideBar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { memo, useEffect } from "react";
import { FaAngleUp, FaQuestion } from "react-icons/fa6";
import { IoIosCall } from "react-icons/io";
import LinkBase from "../link-base";
import { useMobileBottomNavActions } from "./footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { Button } from "../ui/button";
import { IoGiftOutline } from "react-icons/io5";
type Props = {
  contactRightSide: ContactRightside;
  displayVoucherSuggestion: boolean;
};
const SocialContact = ({
  contactRightSide,
  displayVoucherSuggestion,
}: Props) => {
  const { showForm, showVoucher } = useMobileBottomNavActions();
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize SM chat
    window.smAsyncInit = function () {
      window.SM.init({
        page_pid: "ctm68d34faf98684da89c0a6a25",
        trigger_id: "68d358d3b98c79529cb08576",
        chat_type: "PLUGIN",
        env: "prod",
      });
    };

    // Add click event listener for icon_header
    const iconHeader = document.querySelector(".icon_header");
    if (iconHeader) {
      iconHeader.addEventListener("click", () => {
        const chatbox = document.querySelector(
          ".smax-chatbox-sm-chatbox-iframe"
        );
        if (chatbox) {
          chatbox.classList.add("sm-closed");
        }
      });
    }

    // Cleanup event listener on component unmount
    return () => {
      if (iconHeader) {
        iconHeader.removeEventListener("click", () => {
          const chatbox = document.querySelector(
            ".smax-chatbox-sm-chatbox-iframe"
          );
          if (chatbox) {
            chatbox.classList.add("sm-closed");
          }
        });
      }
    };
  }, []);

  return (
    <>
      {displayVoucherSuggestion && (
        <Button
          className={cn(
            "fixed bottom-[20rem] right-4 z-30 mx-auto flex h-9 w-9 flex-row items-center justify-center gap-1 rounded-full border-1 border-orange-400 bg-gradient-to-r from-orange-400 to-pink-400 p-2 shadow-lg transition-all duration-200 ease-in-out hover:from-orange-500 hover:to-pink-500 md:hidden"
          )}
          onClick={showVoucher}
          aria-label="Mã giảm giá"
        >
          <IoGiftOutline className="h-4 w-4 text-white" />
        </Button>
      )}

      <Button
        className={cn(
          "fixed bottom-[17rem] right-4 z-30 mx-auto flex h-9 w-9 flex-row items-center justify-center gap-1 rounded-full border-1 border-danger-400 bg-background/80 p-2 transition-all duration-200 ease-in-out hover:bg-background md:hidden"
        )}
        onClick={showForm}
        aria-label="Hỗ trợ"
      >
        <FaQuestion className="h-4 w-4 text-danger-400" />
      </Button>
      <div id="group-support-hotline" className="mobile-hidden">
        <div
          className={cn(
            "tooltip",
            !contactRightSide.phoneNumber.isshow && "hidden"
          )}
        >
          <LinkBase
            id="contactRightSide-hotline"
            href={contactRightSide.phoneNumber.link}
            target="_blank"
            rel="nofollow"
            className="effect-ring"
            aria-label={`${contactRightSide.phoneNumber.tooltip}`}
          >
            <span className="ct-icon-container btn-sidebar">
              <IoIosCall />
            </span>
          </LinkBase>
          <span className="tooltiptext tooltip-right">
            {contactRightSide.phoneNumber.tooltip}
          </span>
        </div>
        <div
          className={cn(
            "tooltip",
            !contactRightSide.facebook.isshow && "hidden"
          )}
        >
          <LinkBase
            id="contactRightSide-facebook"
            href={contactRightSide.facebook.link}
            target="_blank"
            rel="nofollow"
            className="effect-ring"
            aria-label={`${contactRightSide.facebook.tooltip}`}
          >
            <Image
              src="/static-img/Facebook_Logo.webp"
              alt={contactRightSide.facebook.tooltip}
              width={24}
              height={24}
              className="!h-6 !w-6"
              loading="lazy"
            />
          </LinkBase>
          <span className="tooltiptext tooltip-right">
            {contactRightSide.facebook.tooltip}
          </span>
        </div>
        <div
          className={cn("tooltip", !contactRightSide.zalo.isshow && "hidden")}
        >
          <LinkBase
            id="contactRightSide-zalo"
            href={contactRightSide.zalo.link}
            target="_blank"
            rel="nofollow"
            className="effect-ring block"
            aria-label={`Liên hệ qua ${contactRightSide.zalo.tooltip}`}
          >
            <Image
              src="/static-img/zalo.webp"
              alt="Liên hệ qua Zalo Offical Account"
              width={24}
              height={24}
              className="!h-6 !w-6"
              loading="lazy"
            />
          </LinkBase>
          <span className="tooltiptext tooltip-right">
            {contactRightSide.zalo.tooltip}
          </span>
        </div>
        <div
          className={cn("tooltip", !contactRightSide.map.isshow && "hidden")}
        >
          <LinkBase
            href={contactRightSide.map.link}
            target="_blank"
            rel="nofollow"
            className="effect-ring"
            aria-label={contactRightSide.map.tooltip}
            id="contactRightSide-map"
          >
            <Image
              src="/static-img/google-maps.webp"
              alt="Hướng dẫn đường đi"
              width={24}
              height={24}
              className="!h-6 !w-6"
              loading="lazy"
            />
          </LinkBase>
          <span className="tooltiptext tooltip-right">
            {contactRightSide.map.tooltip}
          </span>
        </div>

        {displayVoucherSuggestion && (
          <div className="tooltip" onClick={showVoucher}>
            <a
              id="voucher-button"
              className="effect-ring voucher-btn"
              href="#voucher"
              aria-label="Mã giảm giá"
              role="button"
              onClick={(e) => {
                e.preventDefault();
                showVoucher();
              }}
            >
              <IoGiftOutline className="text-orange-500" />
            </a>
            <span className="tooltiptext tooltip-right">Mã giảm giá</span>
          </div>
        )}
        <div className="tooltip" onClick={showForm}>
          <a
            id="support-button"
            className="effect-ring"
            href="#support"
            aria-label="Hỗ trợ"
            role="button"
            onClick={(e) => {
              e.preventDefault();
              showForm();
            }}
          >
            <FaQuestion className="text-danger-400" />
          </a>
          <span className="tooltiptext tooltip-right">Hỗ trợ</span>
        </div>
        <div className="tooltip">
          <LinkBase
            href="#top"
            id="top-link"
            className="effect-ring"
            aria-label="Go to top"
          >
            <FaAngleUp />
          </LinkBase>
          <span className="tooltiptext tooltip-right">Lên đầu trang</span>
        </div>
      </div>
    </>
  );
};
export default memo(SocialContact);
