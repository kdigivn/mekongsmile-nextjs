/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { IoClose } from "react-icons/io5";
import { Logo } from "@/services/infrastructure/wordpress/types/logo";
import Image from "next/image";
type Props = {
  logoData: Logo;
};
function PWAInstallPrompt({ logoData }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    if (isStandalone) return;

    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const checkLastDismissed = () => {
      const lastDismissed = localStorage.getItem("pwaPromptDismissed");
      if (lastDismissed) {
        const dismissedDate = new Date(lastDismissed);
        const now = new Date();
        const daysSinceDismissed =
          (now.getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24);
        return daysSinceDismissed < 7;
      }
      return false;
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    if (!checkLastDismissed()) {
      setShowPrompt(true);
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }

    // window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [deferredPrompt]);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem("pwaPromptDismissed", new Date().toISOString());
  }, []);

  if (!showPrompt) return null;

  return (
    <div
      className="fixed left-4 right-4 top-20 z-50 rounded-lg bg-white p-4 text-primary shadow-lg duration-300 animate-in slide-in-from-top lg:hidden"
      role="alert"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 text-primary hover:bg-primary hover:text-primary-foreground"
        onClick={handleDismiss}
        aria-label="Đóng thông báo"
      >
        <IoClose className="h-4 w-4" />
      </Button>
      <h2 className="mb-2 text-lg font-semibold">
        Cài đặt ứng dụng của chúng tôi
      </h2>
      {isIOS ? (
        <div className="flex flex-col gap-2">
          <p>
            Để cài đặt ứng dụng của chúng tôi trên thiết bị iOS của bạn, hãy
            nhấn vào nút chia sẻ{" "}
          </p>
          <SharedButtonCard logoData={logoData} />
          <p>
            {`và sau đó "Thêm vào Màn hình chính"`}
            <span role="img" aria-label="biểu tượng cộng">
              {" "}
              ➕{" "}
            </span>
            .
          </p>
          <AddToHomeScreenCard />
        </div>
      ) : (
        <>
          <p className="mb-4">
            Cài đặt ứng dụng của chúng tôi để có trải nghiệm tốt hơn!
          </p>
          <div className="flex flex-row gap-2">
            <Button onClick={handleInstall}>Cài đặt ngay</Button>
            <Button onClick={handleDismiss}>Đóng</Button>
          </div>
        </>
      )}
    </div>
  );
}

const SharedButtonCard = ({ logoData }: Props) => {
  return (
    <div className="relative flex min-w-[325px] flex-col gap-0.5">
      <div className="m-2 box-border flex h-6 w-full flex-row items-center justify-between rounded-full bg-gray-400/10 px-1 pr-2 text-xl text-gray-400">
        {/* Left Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="m12 20.462l-.846-2.538H5.23q-.698 0-1.195-.496q-.497-.497-.497-1.195V5.238q0-.698.496-1.199q.498-.5 1.196-.5h5.077l.74 2.537h7.721q.74 0 1.217.475t.476 1.216v10.995q0 .698-.476 1.199t-1.217.5zm-4.091-6.266q1.466 0 2.396-.941t.93-2.443q0-.22-.003-.344t-.046-.241H7.825v1.3h1.898q-.18.604-.647.934q-.466.33-1.145.33q-.827 0-1.421-.604t-.594-1.456t.59-1.456t1.413-.604q.379 0 .712.134t.619.42l1.033-.983q-.448-.454-1.072-.715t-1.32-.261q-1.416 0-2.42 1.014q-1.006 1.014-1.006 2.45t1.01 2.452t2.434 1.014m5.653.423l.473-.448q-.293-.367-.551-.7t-.476-.705zm1.057-1.082q.596-.696.905-1.328t.415-1h-3.36l.25.895h.833q.167.319.402.687t.555.745m-1.773 6.08h5.923q.381 0 .614-.244q.232-.243.232-.602V7.777q0-.38-.232-.618q-.233-.236-.613-.236h-7.46l.99 3.435h1.666v-.89h.865v.89h3.092v.852h-1.082q-.212.796-.626 1.561q-.413.766-.992 1.425l2.302 2.271l-.61.61L14.62 14.8l-.765.771l.685 2.352z"
          />
        </svg>
        {/* Center Text */}
        <span className="text-sm text-black">Condao.express</span>
        {/* Right Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M5.5 9.75v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V9.75a.25.25 0 0 0-.25-.25h-2.5a.75.75 0 0 1 0-1.5h2.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 18.25 22H5.75A1.75 1.75 0 0 1 4 20.25V9.75C4 8.784 4.784 8 5.75 8h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25m7.03-8.53l3.25 3.25a.749.749 0 0 1-.326 1.275a.75.75 0 0 1-.734-.215l-1.97-1.97v10.69a.75.75 0 0 1-1.5 0V3.56L9.28 5.53a.75.75 0 0 1-1.042-.018a.75.75 0 0 1-.018-1.042l3.25-3.25a.75.75 0 0 1 1.06 0"
          />
        </svg>
      </div>
      <hr />
      <div className="box-content flex h-12 w-[90%] flex-row items-center justify-start border-b border-b-gray-50 bg-white pl-5">
        <Image
          src={logoData?.siteLogo?.sourceUrl}
          alt="App logo"
          className="h-fit w-fit"
          width={100}
          height={34}
        />
      </div>
      {/* Tooltip */}
      <div className="absolute right-0 top-10 rounded-lg bg-primary px-2 py-1 text-center text-primary-foreground">
        Nhấn nút chia sẻ
        <div className="absolute -top-1 right-2 h-3 w-3 rotate-45 bg-primary"></div>
      </div>
    </div>
  );
};

const AddToHomeScreenCard = () => (
  <div className="relative flex min-w-[325px] flex-col gap-0.5 bg-gray-400/10">
    <div className="flex flex-col gap-3">
      {/* Row of Colored Boxes */}
      <div className="flex w-full flex-row gap-4 overflow-hidden pl-4">
        <div className="h-12 w-20 rounded-md bg-blue-100"></div>
        <div className="h-12 w-20 rounded-md bg-red-100"></div>
        <div className="h-12 w-20 rounded-md bg-green-100"></div>
        <div className="h-12 w-12 rounded-md rounded-br-none rounded-tr-none bg-yellow-100"></div>
      </div>

      {/* Main Card */}
      <div className="h-fit w-full bg-gray-400/10 px-4">
        <div className="w-full rounded-lg border bg-white">
          {/* Header */}
          <div className="h-8 w-full border-b p-2">
            <div className="h-full w-full bg-gray-400/10"></div>
          </div>

          {/* Add to Home Screen Notification */}
          <div className="relative h-8 w-full border-b p-2">
            <div className="absolute -left-2 -top-1 flex h-10 w-[106%] flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 drop-shadow-md">
              <span className="text-sm font-medium">Add to Home Screen</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 48 48"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="4"
                >
                  <rect width="36" height="36" x="6" y="6" rx="3" />
                  <path strokeLinecap="round" d="M24 16v16m-8-8h16" />
                </g>
              </svg>
            </div>
          </div>

          {/* Additional Rows */}
          <div className="h-8 w-full border-b p-2">
            <div className="h-full w-full bg-gray-400/10"></div>
          </div>
          <div className="h-8 w-full p-2">
            <div className="h-full w-full bg-gray-400/10"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default memo(PWAInstallPrompt);
