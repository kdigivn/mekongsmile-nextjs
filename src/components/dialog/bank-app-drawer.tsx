"use client";

import { useGetDeepLinkApps } from "@/services/apis/payments/payments.service";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useTranslation } from "react-i18next";
import { Avatar, CircularProgress, cn, Spinner } from "@heroui/react";
import type { BankApp } from "@/services/apis/payments/types/deeplink-app";
import { useInView } from "react-intersection-observer";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useMobileBottomNavActions } from "../footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";

const POPULAR_BANK_APPS = ["vba", "bidv", "icb", "vcb"];

type PaymentTransfer = {
  message?: string;
  amount?: number;
  accountNumber?: string;
  bankCode?: string;
};

interface BankAppItemProps {
  paymentTransferInfo: PaymentTransfer;
  mobileOS: "ios" | "android";
  isHideNav?: boolean;
}

const BankAppDrawer = ({
  paymentTransferInfo,
  mobileOS,
  isHideNav = false,
}: BankAppItemProps) => {
  const [open, setOpen] = useState(false);
  const [bankApps, setBankApps] = useState<BankApp[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const { hideNav, showNav } = useMobileBottomNavActions();
  const { t } = useTranslation("booking");

  useEffect(() => {
    if (!isHideNav) {
      if (open) {
        hideNav();
      } else {
        showNav();
      }
    }
  }, [open, isHideNav, hideNav, showNav]);

  const { deepLinkAppsLoading, deepLinkAppsRefetch } = useGetDeepLinkApps(
    mobileOS,
    false
  );

  const onOpenBankApp = useCallback(async () => {
    setLoading(true);
    const res = await deepLinkAppsRefetch();
    const apps = res.data?.apps || [];
    if (apps.length > 0) {
      setBankApps(apps);
      setOpen(true);
    } else {
      toast.error(t("bank-app.error"));
    }
    setLoading(false);
  }, [deepLinkAppsRefetch, t]);

  const onClose = useCallback(() => {
    setOpen(false);
    setSearchQuery("");
  }, []);

  const clearSearch = useCallback(() => setSearchQuery(""), []);
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value),
    []
  );

  const filteredAppIds = useMemo(() => {
    if (!debouncedSearchQuery.trim())
      return bankApps.map((app) => app.appId ?? "");
    const q = debouncedSearchQuery.toLowerCase().trim();
    return bankApps
      .filter(
        (app) =>
          (app.appName ?? "").toLowerCase().includes(q) ||
          (app.bankName ?? "").toLowerCase().includes(q) ||
          (app.appId ?? "").toLowerCase().includes(q)
      )
      .map((app) => app.appId ?? "");
  }, [debouncedSearchQuery, bankApps]);

  const popularAppIds = useMemo(() => {
    return bankApps
      .filter((app) => POPULAR_BANK_APPS.includes(app.appId ?? ""))
      .map((app) => app.appId ?? "");
  }, [bankApps]);

  const memoApps = useMemo(
    () => (appIds: string[], display: "row" | "column") =>
      appIds.map((id) => {
        const app = bankApps.find((app) => app.appId === id);
        return (
          app && (
            <BankAppItem
              key={id}
              bankApp={app}
              display={display}
              paymentTransferInfo={paymentTransferInfo}
              openAppLoading={loading}
              setOpenAppLoading={setLoading}
              os={mobileOS}
            />
          )
        );
      }),
    [bankApps, loading, mobileOS, paymentTransferInfo]
  );

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerTrigger asChild>
        <Button
          onClick={onOpenBankApp}
          disabled={loading || deepLinkAppsLoading}
        >
          {(loading || deepLinkAppsLoading) && (
            <Spinner color="white" size="sm" className="mr-1" />
          )}
          Mở ứng dụng ngân hàng
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Mở ứng dụng ngân hàng</DrawerTitle>
        </DrawerHeader>
        {(loading || deepLinkAppsLoading) && (
          <div className="absolute inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-10">
            <CircularProgress aria-label="Loading..." />
          </div>
        )}

        <div className="px-4 pb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm ngân hàng..."
              value={searchQuery}
              onChange={onChange}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
              >
                <FaTimes className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {!filteredAppIds.length ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FaSearch className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-lg font-medium text-gray-600">
              Không tìm thấy ngân hàng
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 px-2">
              <p className="text-md font-bold">
                {searchQuery ? "Phổ biến phù hợp" : "Phổ biến"}
              </p>
              <div className="flex items-center gap-4 overflow-x-auto py-2">
                {memoApps(popularAppIds, "row")}
              </div>
            </div>

            <div className="flex flex-col gap-2 px-2">
              <p className="text-md font-bold">
                {searchQuery
                  ? `Kết quả tìm kiếm (${filteredAppIds.length})`
                  : "Tất cả"}
              </p>
              <div className="flex h-[50vh] flex-col gap-4 overflow-y-auto p-2">
                {memoApps(filteredAppIds, "column")}
              </div>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default memo(BankAppDrawer);

const BankAppItem = memo(function BankAppItem({
  bankApp,
  paymentTransferInfo,
  display = "row",
  os,
  openAppLoading,
  setOpenAppLoading,
}: {
  bankApp: BankApp;
  paymentTransferInfo: PaymentTransfer;
  display?: "row" | "column";
  os: "android" | "ios";
  openAppLoading: boolean;
  setOpenAppLoading: (open: boolean) => void;
}) {
  const { ref, inView } = useInView(
    useMemo(
      () => ({
        triggerOnce: true,
        threshold: 0.8,
        rootMargin: "100px",
      }),
      []
    )
  );
  const [showImage, setShowImage] = useState(false);
  useEffect(() => {
    if (!inView || showImage) return;
    setShowImage(true);
  }, [inView, showImage]);

  const openBankAppWithFallback = useCallback(() => {
    if (openAppLoading) {
      toast("Đang mở ứng dụng, vui lòng đợi...");
      return;
    }

    setOpenAppLoading(true);
    const fallbackUrl =
      os === "ios"
        ? `https://apps.apple.com/search?term=${encodeURIComponent(bankApp.appName ?? "")}`
        : `https://play.google.com/store/search?q=${encodeURIComponent(bankApp.appName ?? "")}&c=apps`;

    let hasRedirected = false;
    const timeoutId = setTimeout(
      () => {
        if (!hasRedirected) window.open(fallbackUrl, "_blank");
        setOpenAppLoading(false);
      },
      os === "ios" ? 10000 : 2000
    );

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearTimeout(timeoutId);
        hasRedirected = true;
        setOpenAppLoading(false);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    const params: string[] = [];
    if (paymentTransferInfo.accountNumber) {
      params.push(
        `ba=${paymentTransferInfo.accountNumber}@${paymentTransferInfo.bankCode?.toLowerCase()}`
      );
    }
    if (paymentTransferInfo.amount) {
      params.push(`am=${encodeURIComponent(paymentTransferInfo.amount)}`);
    }
    if (paymentTransferInfo.message) {
      params.push(`tn=${encodeURIComponent(paymentTransferInfo.message)}`);
    }

    const url =
      params.length > 0
        ? `${bankApp.deeplink}&${params.join("&")}`
        : bankApp.deeplink;
    window.location.href = url ?? fallbackUrl;
  }, [openAppLoading, setOpenAppLoading, bankApp, paymentTransferInfo, os]);

  const content = (
    <>
      <Avatar
        src={
          showImage
            ? `/static/payment-bank-app/apps-logo/${bankApp.appId}.png`
            : undefined
        }
        name={bankApp.appName}
        size="lg"
      />
      {display === "column" ? (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">{bankApp.appName}</span>
          <span className="text-xs text-gray-500">{bankApp.bankName}</span>
        </div>
      ) : (
        <span className="text-sm font-semibold">
          {bankApp.appId?.toUpperCase()}
        </span>
      )}
    </>
  );

  return (
    <div
      ref={ref}
      className={cn(
        "cursor-pointer",
        display === "row"
          ? "flex flex-col items-center justify-start gap-2"
          : "flex w-full flex-row items-center gap-2"
      )}
      onClick={openBankAppWithFallback}
    >
      {content}
    </div>
  );
});
