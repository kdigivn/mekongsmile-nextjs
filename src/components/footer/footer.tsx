/* eslint-disable @arthurgeron/react-usememo/require-usememo */
import React from "react";
import { cn } from "@/lib/utils";
import LinkBase from "../link-base";
import Image from "next/image";
import type { Menu, MenuItem, GeneralSettings } from "@/graphql/types";
import { SecurePaymentBadge } from "@/components/trust-badges";
import LayoutWrapper from "../wrapper/layout-wrapper";

type Props = {
  menu: Menu;
  siteSettings: GeneralSettings;
};

// eslint-disable-next-line @arthurgeron/react-usememo/require-memo
export default function Footer({ menu, siteSettings }: Props) {
  const menuItems = menu.menuItems.nodes ?? [];
  const currentYear = new Date().getFullYear();

  const NodeList = ({
    items,
    level = 0,
  }: {
    items?: MenuItem[];
    level?: number;
  }) => {
    if (!items || items.length === 0) {
      return null;
    }
    return (
      <ul
        className={`flex flex-col gap-2`}
        style={{ marginLeft: `${level}rem` }}
      >
        {items.map((item) => (
          <li
            key={String(item.databaseId)}
            className="flex flex-col gap-2 text-start align-middle text-sm font-medium"
          >
            <LinkBase
              href={item.path || item.url}
              className="text-white/70 transition-all duration-200 hover:text-white"
            >
              {item.label}
            </LinkBase>
            {<NodeList items={item.childItems?.nodes} level={level + 1} />}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <footer id="main-footer" className="flex w-full flex-col justify-center bg-brand-navy text-white">
      <div className="flex h-auto w-full items-center justify-center py-9">
        <div className="container max-w-screen-xl px-0">
          <div className="flex w-full max-w-screen-xl flex-col flex-nowrap justify-between gap-4 px-4 sm:flex-col md:flex-col md:px-6 lg:flex-row lg:px-8">
            <div className="grid w-full grid-cols-2 justify-between gap-4 gap-y-4 md:grid-cols-5 lg:flex">
              {/* Section 1 — Brand */}
              <div className="col-span-2 flex w-full flex-col gap-2 md:col-span-3 lg:w-80">
                <div className="text-sm">
                  <LinkBase href={"/"}>
                    <Image
                      src="/static-img/mekongsmile-logo-full.png"
                      alt={siteSettings.title}
                      width={180}
                      height={48}
                      className="!rounded-none brightness-0 invert"
                      unoptimized
                    />
                  </LinkBase>
                </div>
                <p className="text-sm font-semibold text-white">{siteSettings.title}</p>
                <p className="text-sm text-white/70">
                  {siteSettings.description}
                </p>
              </div>

              {/* Section 2 — Menu columns */}
              {menuItems.map((item, index) => (
                <div
                  className={cn(
                    "flex w-full flex-col gap-2 text-base font-bold lg:w-fit",
                    index % 2 === 0
                      ? "col-span-1 md:col-span-2"
                      : "col-span-1 md:col-span-3"
                  )}
                  key={String(item.databaseId)}
                >
                  {item.label}
                  {!!item.childItems?.nodes && (
                    <NodeList items={item.childItems?.nodes} />
                  )}
                </div>
              ))}

              {/* Section 3 — Contact form + payment icons */}
              <div
                className={cn(
                  "col-span-2 flex w-full flex-col gap-0 text-base font-bold md:col-span-5 lg:w-80",
                  menuItems.length % 2 === 0 ? "md:col-span-2" : "md:col-span-3"
                )}
              >
                <div className="mb-2 opacity-70">
                  <SecurePaymentBadge />
                </div>
                <div className="grid w-full grid-cols-5 gap-2 opacity-70">
                  <Image
                    src={"/static-img/pay-img/vietqr.svg"}
                    alt="VietQR"
                    width={200}
                    height={30}
                    className="col-span-1 h-12 w-full object-contain"
                  />
                  <Image
                    src={"/static-img/pay-img/Logo_OnePay.svg"}
                    alt="OnePay"
                    width={200}
                    height={200}
                    className="col-span-1 h-12 w-full object-contain"
                  />
                  <div className="col-span-1 h-full w-full overflow-hidden">
                    <Image
                      src={"/static-img/pay-img/visa.svg"}
                      alt="Visa"
                      width={200}
                      height={200}
                      className="h-full w-full scale-150 object-contain"
                    />
                  </div>
                  <div className="col-span-1 h-12 w-full overflow-hidden">
                    <Image
                      src={"/static-img/pay-img/mastercard.svg"}
                      alt="Mastercard"
                      width={200}
                      height={200}
                      className="scale-130 h-full w-full object-contain"
                    />
                  </div>
                  <Image
                    src={"/static-img/pay-img/MoMo-Logo.webp"}
                    alt="MoMo"
                    width={200}
                    height={200}
                    className="col-span-1 h-12 w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LayoutWrapper className="pb-0">
        <div className="container flex w-full max-w-screen-xl px-2 pb-24 pt-6 text-center text-xs text-white/50 lg:px-0 lg:pb-6">
          <span>
            {`© ${currentYear} ${siteSettings.title}. All rights reserved.`}
          </span>
        </div>
      </LayoutWrapper>
    </footer>
  );
}
