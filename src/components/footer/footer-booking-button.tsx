"use client";

import { usePathname } from "next/navigation";
import { memo } from "react";
import LinkBase from "../link-base";
import { LuShoppingBag } from "react-icons/lu";

const FooterBookingButton = () => {
  const pathName = usePathname();
  const listUrl = [
    "/",
    "/hang",
    "/diem-den",
    "/product-category",
    "khoi-hanh-tu",
  ];
  return (
    listUrl.some((url) => pathName.includes(url)) && (
      <LinkBase
        href="#product_loop_contact_form"
        data-shortcut="custom_link"
        data-label="bottom"
        aria-label="Đặt ngay"
      >
        <span className="ct-label">Đặt ngay</span>
        <span className="ct-icon-container">
          <LuShoppingBag />
        </span>
      </LinkBase>
    )
  );
};
export default memo(FooterBookingButton);
