/* eslint-disable @arthurgeron/react-usememo/require-usememo */
import React from "react";
import { cn } from "@/lib/utils";
import LinkBase from "../link-base";
// import { Tooltip } from "@heroui/react";
import { getServerTranslation } from "@/services/i18n";
import {
  ChildItem,
  Menus,
} from "@/services/infrastructure/wordpress/types/menu";
import { IoIosCall } from "react-icons/io";
import { FaFacebook } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import Image from "next/image";
import { FooterInfo } from "@/services/infrastructure/wordpress/types/footer";
import { ContactRightside } from "@/services/infrastructure/wordpress/types/sideBar";
import FooterMobileContactButtons from "./footer-mobile-contact-buttons/footer-mobile-contact-buttons";
import LayoutWrapper from "../wrapper/layout-wrapper";
import { Logo } from "@/services/infrastructure/wordpress/types/logo";
import FooterContactForm from "./footer-contact-form";
import { MdCall } from "react-icons/md";
import dynamic from "next/dynamic";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { getDisplayVoucherSuggestion } from "@/services/infrastructure/wordpress/queries/getBlockCustom";

type Props = {
  language: string;
  footerMenu: Menus;
  contactRightSide: ContactRightside;
  footerInfo: FooterInfo | null;
  logoData: Logo;
};

const SocialContact = dynamic(() => import("./social-contact"));
// eslint-disable-next-line @arthurgeron/react-usememo/require-memo
export default async function Footer({
  language,
  footerMenu,
  contactRightSide,
  footerInfo,
  logoData,
}: Props) {
  const { t } = await getServerTranslation(language, "footer/footer");
  const menuItems = footerMenu.menus.nodes[0]?.menuItems.nodes ?? [];

  const displayVoucherSuggestion = await getDisplayVoucherSuggestion();

  const NodeList = ({
    items,
    level = 0,
  }: {
    items?: ChildItem[];
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
            key={item.id}
            className="flex flex-col gap-2 text-start align-middle text-sm font-medium"
          >
            <LinkBase
              href={item.path}
              className="transition-all duration-200 hover:text-primary"
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
    <>
      <SocialContact
        contactRightSide={contactRightSide}
        displayVoucherSuggestion={displayVoucherSuggestion}
      />
      {/* <div id="group-support-hotline" className="mobile-hidden">
        <div className="tooltip">
          <Link
            href={contactRightSide.phoneNumber.link}
            target="_blank"
            rel="nofollow"
            className="effect-ring"
            aria-label={`${contactRightSide.phoneNumber.tooltip}`}
          >
            <span className="ct-icon-container btn-sidebar">
              <IoIosCall />
            </span>
          </Link>
          <span className="tooltiptext tooltip-right">
            {contactRightSide.phoneNumber.tooltip}
          </span>
        </div>
        <div className="tooltip">
          <Link
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
            />
          </Link>
          <span className="tooltiptext tooltip-right">
            {contactRightSide.facebook.tooltip}
          </span>
        </div>
        <div className="tooltip">
          <Link
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
            />
          </Link>
          <span className="tooltiptext tooltip-right">
            {contactRightSide.zalo.tooltip}
          </span>
        </div>
        <div className="tooltip">
          <Link
            href="https://s.ncmk.me/map"
            target="_blank"
            rel="nofollow"
            className="effect-ring"
            aria-label="Hướng dẫn đường đi"
          >
            <Image
              src="/static-img/google-maps.webp"
              alt="Hướng dẫn đường đi"
              width={24}
              height={24}
              className="!h-6 !w-6"
            />
          </Link>
          <span className="tooltiptext tooltip-right">Hướng dẫn đường đi</span>
        </div>
        <div className="tooltip visible-tooltip">
          <div className="active-btn"></div>
          <LiveChatLink type={"button"} />
          <span className="tooltiptext tooltip-right">
            Chúng tôi đang online, chat ngay
          </span>
        </div>
        <div className="tooltip">
          <Link
            href="#top"
            id="top-link"
            className="effect-ring"
            aria-label="Go to top"
          >
            <FaAngleUp />
          </Link>
          <span className="tooltiptext tooltip-right">Lên đầu trang</span>
        </div>
      </div> */}

      <FooterMobileContactButtons />

      <footer id="main-footer" className="flex w-full flex-col justify-center">
        <div className="flex h-auto w-full items-center justify-center bg-white py-9">
          <div className="container max-w-screen-xl px-0">
            <div className="flex w-full max-w-screen-xl flex-col flex-nowrap justify-between gap-4 px-4 sm:flex-col md:flex-col md:px-6 lg:flex-row lg:px-8">
              <div className="grid w-full grid-cols-2 justify-between gap-4 gap-y-4 md:grid-cols-5 lg:flex">
                {/* Section 1 */}
                <div className="col-span-2 flex w-full flex-col gap-2 md:col-span-3 lg:w-80">
                  <div className="text-sm">
                    <LinkBase href={"/"} target="_blank">
                      <Image
                        src={logoData?.siteLogo?.sourceUrl}
                        alt={logoData?.siteLogo?.title}
                        width={150}
                        height={50}
                        className="!rounded-none"
                      />
                    </LinkBase>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {footerInfo?.address?.map((item, inx) => (
                      <li className="text-sm font-medium" key={inx}>
                        {item.text}
                        <span>
                          <LinkBase
                            href={item.link}
                            target="_blank"
                            className="font-bold text-primary transition-all duration-300 hover:underline"
                          >
                            {" " + t("text.text-08")}
                          </LinkBase>
                        </span>
                      </li>
                    ))}
                    <li className="flex gap-1 text-start align-middle text-sm font-medium">
                      <span className="group">
                        <Tooltip>
                          <TooltipTrigger>
                            <LinkBase
                              href={contactRightSide.facebook.link ?? ""}
                              target="_blank"
                              className="flex items-center justify-center rounded-full border-3 border-default-400 p-2 opacity-60 transition-all duration-300 ease-in-out group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:opacity-100"
                              aria-label={`${contactRightSide.facebook.tooltip}`}
                            >
                              <FaFacebook className="h-5 w-5 text-primary opacity-60 transition-all duration-300 ease-in-out group-hover:text-white group-hover:opacity-100" />
                            </LinkBase>
                          </TooltipTrigger>
                          <TooltipContent>
                            {contactRightSide.facebook.tooltip ?? ""}
                          </TooltipContent>
                        </Tooltip>
                        {/* <Tooltip
                          content={contactRightSide.facebook.tooltip ?? ""}
                        >
                          <LinkBase
                            id="footer-facebook"
                            href={contactRightSide.facebook.link ?? ""}
                            target="_blank"
                            className="flex items-center justify-center rounded-full border-3 border-default-400 p-2 opacity-60 transition-all duration-300 ease-in-out group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:opacity-100"
                            aria-label={`${contactRightSide.facebook.tooltip}`}
                          >
                            <FaFacebook className="h-5 w-5 text-primary opacity-60 transition-all duration-300 ease-in-out group-hover:text-white group-hover:opacity-100" />
                          </LinkBase>
                        </Tooltip> */}
                      </span>

                      <span className="group">
                        {/* <Tooltip content={contactRightSide.zalo.tooltip ?? ""}>
                          <LinkBase
                            id="footer-zalo"
                            href={contactRightSide.zalo.link ?? ""}
                            target="_blank"
                            className="flex items-center justify-center rounded-full border-3 border-default-400 p-2 opacity-60 transition-all duration-300 ease-in-out group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:opacity-100"
                            aria-label={`Liên hệ qua ${contactRightSide.zalo.tooltip}`}
                          >
                            <SiZalo className="h-5 w-5 text-primary opacity-60 transition-all duration-300 ease-in-out group-hover:text-white group-hover:opacity-100" />
                          </LinkBase>
                        </Tooltip> */}
                        <Tooltip>
                          <TooltipTrigger>
                            <LinkBase
                              href={contactRightSide.zalo.link ?? ""}
                              target="_blank"
                              className="flex items-center justify-center rounded-full border-3 border-default-400 p-2 opacity-60 transition-all duration-300 ease-in-out group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:opacity-100"
                              aria-label={`Liên hệ qua ${contactRightSide.zalo.tooltip}`}
                            >
                              <SiZalo className="h-5 w-5 text-primary opacity-60 transition-all duration-300 ease-in-out group-hover:text-white group-hover:opacity-100" />
                            </LinkBase>
                          </TooltipTrigger>
                          <TooltipContent>
                            {contactRightSide.zalo.tooltip ?? ""}
                          </TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="group">
                        {/* <Tooltip
                          content={contactRightSide.phoneNumber.tooltip ?? ""}
                        >
                          <LinkBase
                            id="footer-phone-number"
                            href={contactRightSide.phoneNumber.link}
                            className="flex items-center justify-center rounded-full border-3 border-default-400 p-2 opacity-60 transition-all duration-300 ease-in-out group-hover:border-primary group-hover:bg-primary group-hover:opacity-100"
                            aria-label={`${contactRightSide.phoneNumber.tooltip}`}
                          >
                            <IoIosCall className="h-5 w-5 text-primary opacity-60 transition-all duration-300 ease-in-out group-hover:text-white group-hover:opacity-100" />
                          </LinkBase>
                        </Tooltip> */}
                        <Tooltip>
                          <TooltipTrigger>
                            <LinkBase
                              href={contactRightSide.phoneNumber.link}
                              className="flex items-center justify-center rounded-full border-3 border-default-400 p-2 opacity-60 transition-all duration-300 ease-in-out group-hover:border-primary group-hover:bg-primary group-hover:opacity-100"
                              aria-label={`${contactRightSide.phoneNumber.tooltip}`}
                            >
                              <IoIosCall className="h-5 w-5 text-primary opacity-60 transition-all duration-300 ease-in-out group-hover:text-white group-hover:opacity-100" />
                            </LinkBase>
                          </TooltipTrigger>
                          <TooltipContent>
                            {contactRightSide.phoneNumber.tooltip ?? ""}
                          </TooltipContent>
                        </Tooltip>
                      </span>
                    </li>
                    <li>
                      {/* <Tooltip
                        content={contactRightSide.phoneNumber.tooltip ?? ""}
                      >
                        <LinkBase
                          href={contactRightSide.phoneNumber.link}
                          aria-label={`Liên hệ qua ${contactRightSide.phoneNumber.text}`}
                        >
                          <Button
                            className="flex h-fit w-full max-w-72 flex-wrap gap-2 text-wrap"
                            id="footer-btn-phone-number"
                          >
                            <MdCall size={24} />
                            {contactRightSide.phoneNumber.text}
                          </Button>
                        </LinkBase>
                      </Tooltip> */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button className="flex h-fit w-full max-w-72 flex-wrap gap-2 text-wrap">
                            <LinkBase
                              href={contactRightSide.phoneNumber.link}
                              aria-label={`Liên hệ qua ${contactRightSide.phoneNumber.text}`}
                              className="flex items-center justify-center gap-2"
                            >
                              <MdCall size={24} />
                              {contactRightSide.phoneNumber.text}
                            </LinkBase>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {contactRightSide.phoneNumber.tooltip ?? ""}
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  </ul>
                </div>
                {/* Section 2 */}

                {menuItems.map((item, index) => (
                  <div
                    className={cn(
                      "flex w-full flex-col gap-2 text-base font-bold lg:w-fit",
                      index % 2 === 0
                        ? "col-span-1 md:col-span-2"
                        : "col-span-1 md:col-span-3"
                    )}
                    key={item.id}
                  >
                    {item.label}
                    {!!item.childItems?.nodes && (
                      <NodeList items={item.childItems?.nodes} />
                    )}
                  </div>
                ))}

                {/* Section 3 */}
                <div
                  className={cn(
                    "col-span-2 flex w-full flex-col gap-0 text-base font-bold md:col-span-5 lg:w-80",
                    menuItems.length % 2 === 0
                      ? "md:col-span-2"
                      : "md:col-span-3"
                  )}
                >
                  {/* <div className="flex items-center gap-2">
                    <Input
                      placeholder="Để lại số điện thoại/Zalo"
                      className="rounded-lg bg-white text-base font-normal"
                    />
                    <Button className="rounded-lg hover:cursor-not-allowed">
                      <IoIosCall className="h-5 w-5 text-white" />
                    </Button>
                  </div> */}
                  <FooterContactForm />
                  <div className="grid w-full grid-cols-5 gap-2">
                    <Image
                      src={"/static-img/pay-img/vietqr.svg"}
                      alt="viet QR"
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
                  {/* <div className="grid w-full grid-cols-3 justify-items-center gap-2">
                    <LinkBase
                      className="col-span-1"
                      href={
                        "http://online.gov.vn/Home/WebDetails/50082?AspxAutoDetectCookieSupport=1"
                      }
                      target="_blank"
                    >
                      <Image
                        src={
                          "/static-img/logo-da-thong-bao-website-voi-bo-cong-thuong.png"
                        }
                        alt="viet QR"
                        width={200}
                        height={30}
                        className="h-12 w-full object-contain"
                      />
                    </LinkBase>
                    <LinkBase
                      className="col-span-1"
                      href={"https://www.dmca.com/"}
                      target="_blank"
                    >
                      <Image
                        src={"/static-img/DMCA-protected.webp"}
                        alt="OnePay"
                        width={200}
                        height={200}
                        className="h-12 w-full object-contain"
                      />
                    </LinkBase>
                    <LinkBase
                      className="col-span-1"
                      href={"https://tinnhiemmang.vn/"}
                      target="_blank"
                    >
                      <Image
                        src={"/static-img/ncsc.webp"}
                        alt="OnePay"
                        width={200}
                        height={200}
                        className="h-12 w-full object-contain"
                      />
                    </LinkBase>
                  </div> */}
                  <span>Hệ sinh thái</span>
                  <div className="grid w-full grid-cols-4 justify-items-center gap-2 pt-2">
                    {footerInfo?.ecosystem.map((item, inx) => (
                      <LinkBase
                        className="w-full overflow-hidden"
                        key={inx}
                        href={item.link ?? ""}
                        target="_blank"
                      >
                        <Image
                          src={
                            item.logo?.node.sourceUrl ??
                            "/static-img/condao.express-Logo-500x500.png"
                          }
                          alt={item.name}
                          width={80}
                          height={80}
                          className="aspect-square w-full object-contain"
                          unoptimized
                        />
                      </LinkBase>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LayoutWrapper className="pb-0">
          <div className="container flex w-full max-w-screen-xl px-2 pb-24 pt-6 text-center text-xs lg:px-0 lg:pb-6">
            <span
              dangerouslySetInnerHTML={{
                __html: footerInfo?.subfooter ?? "",
              }}
            />
          </div>
        </LayoutWrapper>
      </footer>
    </>
  );
}
