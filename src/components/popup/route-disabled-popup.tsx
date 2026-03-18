"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { memo, useEffect } from "react";
import { BiGlobe, BiPhone } from "react-icons/bi";
import { useMobileBottomNavActions } from "../footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { FaBell } from "react-icons/fa6";
import LinkBase from "../link-base";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function RouteDisabledPopup({ isOpen, onClose }: Props) {
  const { hideNav, showNav } = useMobileBottomNavActions();
  useEffect(() => {
    if (isOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isOpen, showNav]);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return isDesktop ? (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        closeIconClassName="h-4 w-4"
        closeButtonClassName="border-2 border-default-100 p-1 rounded-md right-2 hover:border-danger-500"
        className="!b-0 hidden min-w-[767px] flex-col items-center !bg-[url('/static-img/bau-troi.webp')] bg-bottom bg-no-repeat p-0 lg:flex lg:overflow-hidden"
      >
        <Image
          src="/static-img/condao.express-Logo-500x500.png"
          alt="Condao Express Logo"
          width={56}
          height={56}
          className="relative h-16 w-16 translate-x-6 translate-y-6 self-start object-contain"
        />
        <div className="flex min-w-96 max-w-xl -translate-y-5 flex-col items-center justify-center gap-4">
          <div className="relative w-fit">
            <FaBell
              className="h-14 w-14 text-yellow-400"
              fill="currentColor"
              strokeWidth={1}
            />
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
              1
            </div>
          </div>

          <h2 className="max-w-2xl text-center text-2xl font-bold">
            Hiện tại tuyến tàu này đang{" "}
            <span className="text-red-500">tạm dừng hoạt động</span> đến khi có
            thông báo mới nhất
          </h2>

          <div className="flex w-fit flex-col gap-2 rounded-3xl bg-white p-8 will-change-auto backdrop:blur-md">
            <div className="text-center text-lg font-semibold text-primary">
              Quý khách có thể tham khảo
            </div>

            <div className="flex flex-col gap-5">
              <LinkBase href="/product/ve-tau-soc-trang-con-dao/">
                <Button className="w-full text-lg font-medium">
                  Tuyến Sóc Trăng - Côn Đảo
                </Button>
              </LinkBase>
              <LinkBase href="/product/ve-tau-tran-de-con-dao/">
                <Button className="w-full text-lg font-medium">
                  Tuyến Trần Đề - Côn Đảo
                </Button>
              </LinkBase>
              <LinkBase href="/lich-tau-vung-tau-con-dao/">
                <Button className="w-full text-lg font-medium">
                  Tuyến Vũng Tàu - Côn Đảo
                </Button>
              </LinkBase>
            </div>
          </div>
        </div>
        <div className="mt-8 flex w-full items-center justify-center gap-4 rounded-t-lg bg-primary p-4 text-white">
          <div className="flex items-center gap-2">
            <BiGlobe className="h-6 w-6" />
            {/* <span className="text-lg font-medium">Condao.express</span> */}
          </div>
          <div className="flex items-center gap-2">
            <BiPhone className="h-6 w-6" />
            <span className="text-lg font-medium">0924299898</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={isOpen} onClose={onClose} onOpenChange={onClose}>
      <DrawerContent className="!b-0 flex flex-col items-center overflow-hidden !bg-[url('/static-img/bau-troi.webp')] bg-bottom bg-no-repeat p-0 lg:hidden">
        {/* Logo */}
        <Image
          src="/static-img/condao.express-Logo-500x500.png"
          alt="Condao Express Logo"
          width={56}
          height={56}
          className="relative h-16 w-16 translate-x-6 translate-y-6 self-start object-contain"
        />
        <div className="flex -translate-y-5 flex-col items-center justify-center gap-4 px-5">
          {/* Notification Bell */}
          <div className="relative w-fit">
            <FaBell
              className="h-14 w-14 text-yellow-400"
              fill="currentColor"
              strokeWidth={1}
            />
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
              1
            </div>
          </div>

          <h2 className="max-w-2xl text-center text-xl font-bold">
            Hiện tại tuyến tàu này đang{" "}
            <span className="text-red-500">tạm dừng hoạt động</span> đến khi có
            thông báo mới nhất
          </h2>

          {/* Main Content */}
          <div className="flex w-fit flex-col gap-2 rounded-3xl bg-white p-8 will-change-auto backdrop:blur-md">
            <div className="text-center text-lg font-semibold text-primary">
              Quý khách có thể tham khảo
            </div>

            <div className="flex flex-col gap-5">
              <LinkBase href="/product/ve-tau-tran-de-con-dao/">
                <Button className="w-full text-lg font-medium">
                  Tuyến Sóc Trăng - Côn Đảo
                </Button>
              </LinkBase>
              <LinkBase href="/product/ve-tau-soc-trang-con-dao/">
                <Button className="w-full text-lg font-medium">
                  Tuyến Trần Đề - Côn Đảo
                </Button>
              </LinkBase>
              <LinkBase href="/lich-tau-vung-tau-con-dao/">
                <Button className="w-full text-lg font-medium">
                  Tuyến Vũng Tàu - Côn Đảo
                </Button>
              </LinkBase>
            </div>
          </div>
        </div>
        <DrawerFooter className="mt-4 flex w-full items-center justify-center gap-4 rounded-t-lg bg-primary p-2 text-white">
          <DrawerClose asChild>
            <Button className="flex items-center gap-2">Đóng</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default memo(RouteDisabledPopup);
