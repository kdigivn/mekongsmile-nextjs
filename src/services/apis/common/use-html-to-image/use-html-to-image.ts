/* eslint-disable @arthurgeron/react-usememo/require-usememo */

"use client";

import {
  html2ImagePrepareForCapture,
  html2ImageRestoreAfterCapture,
} from "@/components/html-to-image/helper";
import { toBlob, toPng } from "html-to-image";
import { toast } from "sonner";
import { Operator } from "../../operators/types/operator";

/**
 * Add hidden class name to element do not want to capture
 */
export enum HTML2ImageHiddenClassKey {
  IGNORE_CAPTURE = "ignore-capture",
}

type CaptureProps = {
  type: "clipboard" | "download" | "image-url";
  successMessage: string;
  errorMessage: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  downloadFileName?: string;
  sectionCapture?:
    | "voyages-schedules"
    | "voyages-schedules-mobile"
    | "boat-layout"
    | "mobile-boat-layout"
    | "default";
  operatorLayout?: Operator["operator_code"];
};

function useHTML2Image({ captureId }: { captureId: string }) {
  const capture = async ({
    type,
    successMessage,
    errorMessage,
    setLoading,
    downloadFileName,
    sectionCapture = "default",
    operatorLayout,
  }: CaptureProps): Promise<string | void> => {
    // Đảm bảo return type thống nhất
    setLoading(true);

    if (typeof document === "undefined") {
      toast.error("Window document not found!");
      setLoading(false);
      return;
    }

    const { processElement, hiddenContainer } = html2ImagePrepareForCapture(
      captureId,
      sectionCapture,
      operatorLayout
    );

    try {
      let dataUrl: string;
      switch (type) {
        case "clipboard":
          try {
            if (!navigator.clipboard || !navigator.clipboard.write) {
              toast.error("Không hỗ trợ clipboard từ trình duyệt của bạn");
              return;
            }
            await navigator.clipboard.write([
              new ClipboardItem({
                ["image/png"]: Promise.resolve(
                  toBlob(processElement, {
                    cacheBust: true,
                    includeQueryParams: true,
                    filter: (node) => {
                      const exclusionClasses = [
                        HTML2ImageHiddenClassKey.IGNORE_CAPTURE,
                      ];
                      return !exclusionClasses.some((classname) =>
                        node.classList?.contains(classname)
                      );
                    },
                    // backgroundColor: "#ffffff",
                  }) as Promise<Blob>
                ),
              }),
            ]);
            // If execution reaches here, clipboard.write was successful
            toast.success(successMessage);
          } catch (error) {
            toast.error(errorMessage);
            // toast.error(`Error copying to clipboard: ${JSON.stringify(error)}`);
            console.error("Error copying to clipboard:", error);
          }
          break;
        case "download":
          dataUrl = await toPng(processElement, {
            cacheBust: true,
            includeQueryParams: true,
            filter: (node) => {
              const exclusionClasses = [
                HTML2ImageHiddenClassKey.IGNORE_CAPTURE,
              ];
              return !exclusionClasses.some((classname) =>
                node.classList?.contains(classname)
              );
            },
            // backgroundColor: "#ffffff",
          });

          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `${downloadFileName || "canvas"}.png`;
          link.click();
          toast.success(successMessage);
          break;
        case "image-url":
          dataUrl = await toPng(processElement, {
            cacheBust: true,
            includeQueryParams: true,
            filter: (node) => {
              const exclusionClasses = [
                HTML2ImageHiddenClassKey.IGNORE_CAPTURE,
              ];
              return !exclusionClasses.some((classname) =>
                node.classList?.contains(classname)
              );
            },
            backgroundColor: "#ffffff",
          });

          return dataUrl; // Trả về URL ảnh
        default:
          toast.error("Invalid capture type");
      }
    } catch (error) {
      console.error("Error capturing image:", error);
    } finally {
      html2ImageRestoreAfterCapture(hiddenContainer);
      setLoading(false);
    }
  };

  return { capture };
}

export default useHTML2Image;
