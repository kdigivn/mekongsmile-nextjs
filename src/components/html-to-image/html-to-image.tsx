/* eslint-disable @arthurgeron/react-usememo/require-usememo */
"use client";

import React, { memo, useCallback, useState } from "react";
import { HiDownload } from "react-icons/hi";
import { IoMdClipboard } from "react-icons/io";
import { IoCameraOutline, IoChevronDown } from "react-icons/io5";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Spinner } from "@heroui/react";
import useHTML2Image from "@/services/apis/common/use-html-to-image/use-html-to-image";
import { useCheckMobile } from "@/hooks/use-check-screen-type";
import { Operator } from "@/services/apis/operators/types/operator";

type Props = {
  captureId: string;
  captureButtonName: string;
  clipboard?: {
    successMessage?: string;
    errorMessage?: string;
  };
  download?: {
    successMessage?: string;
    errorMessage?: string;
    downloadFileName?: string;
  };
  sectionCapture?:
    | "voyages-schedules"
    | "voyages-schedules-mobile"
    | "boat-layout"
    | "mobile-boat-layout"
    | "default";
  operatorLayout?: Operator["operator_code"];
};

const HTMLToImage = ({
  captureId,
  captureButtonName,
  clipboard,
  download,
  sectionCapture,
  operatorLayout,
}: Props) => {
  const [captureClipBoardLoading, setCaptureClipBoardLoading] =
    useState<boolean>(false);
  const [captureDownloadLoading, setCaptureDownloadLoading] =
    useState<boolean>(false);

  /**
   * CUSTOM HOOK
   */
  const { capture } = useHTML2Image({ captureId: captureId });
  const isMobile = useCheckMobile();

  /**
   * HANDLE LOGIC
   */
  const handleCaptureClipboard = useCallback(async () => {
    capture({
      type: "clipboard",
      successMessage:
        clipboard?.successMessage ?? "Sao chép đến clipboard thành công!",
      errorMessage:
        clipboard?.errorMessage ?? "Sao chép đến clipboard thất bại!",
      setLoading: setCaptureClipBoardLoading,
      sectionCapture,
      operatorLayout,
    });
    // }
  }, [
    capture,
    clipboard?.errorMessage,
    clipboard?.successMessage,
    operatorLayout,
    sectionCapture,
  ]);

  const handleCaptureDownLoadSeatModal = useCallback(() => {
    capture({
      type: "download",
      successMessage: download?.successMessage ?? "Tải ảnh thành công!",
      errorMessage: download?.errorMessage ?? "Tải ảnh thất bại!",
      setLoading: setCaptureDownloadLoading,
      downloadFileName: download?.downloadFileName ?? "ferry_ticket_capture",
      sectionCapture,
      operatorLayout,
    });
  }, [
    capture,
    download?.downloadFileName,
    download?.errorMessage,
    download?.successMessage,
    operatorLayout,
    sectionCapture,
  ]);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            className="flex w-fit items-center justify-center gap-2"
            aria-label={captureButtonName}
          >
            <IoCameraOutline size={16} />
            {isMobile ? null : captureButtonName}
            {!isMobile && <IoChevronDown size={16} />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full">
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              className="flex w-full items-center justify-center gap-2"
              onClick={handleCaptureClipboard}
              aria-label="Lưu clipboard"
            >
              <IoMdClipboard size={16} />
              Lưu clipboard
              {captureClipBoardLoading && (
                <Spinner color="white" size="sm" className="mr-1" />
              )}
            </Button>
            <Button
              size="sm"
              className="flex w-full items-center justify-center gap-2"
              onClick={handleCaptureDownLoadSeatModal}
              aria-label="Tải ảnh"
            >
              <HiDownload size={16} />
              Tải ảnh
              {captureDownloadLoading && (
                <Spinner color="white" size="sm" className="mr-1" />
              )}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default memo(HTMLToImage);
