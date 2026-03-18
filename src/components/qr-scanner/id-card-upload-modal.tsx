"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  memo,
  useEffect,
  useRef,
} from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { IoCloseOutline } from "react-icons/io5";
import { IdCardResponse, IdCardToPassenger } from "./id-card-type";
import { toast } from "sonner";
import { useCheckDesktop } from "@/hooks/use-check-screen-type";
import {
  DrawerContent,
  Drawer,
  DrawerTitle,
  DrawerHeader,
  DrawerFooter,
} from "../ui/drawer";
import { useMobileBottomNavActions } from "../footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { FaCamera, FaIdCard } from "react-icons/fa6";
import { FaCloudUploadAlt } from "react-icons/fa";
import { buildApiPath } from "@/services/apis/build-api-path";
import { FerryTicketApiEndpoints } from "@/services/apis/endpoints";
import { TbLoader2 } from "react-icons/tb";
import { TicketGenderEnum } from "@/services/apis/tickets/types/ticket-gender-enum";

type Step = "guide" | "front" | "submit";

function IDCardUploadModal({
  isOpen,
  onClose,
  onResult,
}: {
  isOpen: boolean;
  onClose: () => void;
  onResult: (result: IdCardToPassenger) => void;
}) {
  const [step, setStep] = useState<Step>("guide");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [imageFrontFile, setImageFrontFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDesktop = useCheckDesktop();

  const stepFrontRef = useRef<HTMLDivElement>(null);

  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (isOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isOpen, showNav]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      setError(null);

      reader.onload = (event) => {
        if (step === "front") {
          if (file.size > 5 * 1024 * 1024) {
            setError("Kích thước hình ảnh quá lớn! (Tối đa 5MB)");
          } else {
            setImageFrontFile(file);
            setFrontImage(event.target?.result as string);
          }
        }
      };

      reader.readAsDataURL(file);
    },
    [step]
  );

  const onPaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      const items = event.clipboardData.items;
      const file: File | null = Array.from(items)
        .find((item) => item.kind === "file" && item.type.includes("image"))
        ?.getAsFile() as File;

      if (file) {
        const reader = new FileReader();
        setError(null);

        reader.onload = (event) => {
          if (step === "front") {
            if (file.size > 5 * 1024 * 1024) {
              setError("Kích thước hình ảnh quá lớn! (Tối đa 5MB)");
            } else {
              setImageFrontFile(file);
              setFrontImage(event.target?.result as string);
            }
          }
        };

        reader.readAsDataURL(file);
      }
    },
    [step]
  );

  useEffect(() => {
    if (step === "front") {
      stepFrontRef.current?.focus();
    }
  }, [step]);

  const { getRootProps, getInputProps } = useDropzone(
    useMemo(
      () => ({
        onDrop,
        accept: {
          "image/jpeg": [".jpeg", ".jpg"],
          "image/png": [".png"],
        },
        multiple: false,
        maxFiles: 1,
      }),
      [onDrop]
    )
  );

  const handleNext = useCallback(() => {
    if (step === "front" && frontImage) {
      setStep("submit");
    }
  }, [step, frontImage]);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);

    // Gửi frontImage và backImage lên server
    console.log("Đang gửi hình ảnh mặt trước thẻ CCCD lên server...");

    const formData = new FormData();

    formData.append("image_front", imageFrontFile!);

    try {
      const url = buildApiPath(FerryTicketApiEndpoints.ai.scanIdCard);
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const data: IdCardResponse = await response.json();
      if (data.code === 1) {
        toast.success("Tải lên thẻ CCCD thành công");
        const result: IdCardToPassenger = {
          name: data.information.name,
          gender:
            data.information.sex === "Nam"
              ? TicketGenderEnum.Male
              : TicketGenderEnum.Female,
          birthdate: data.information.birthday,
          address: data.information.address,
          cccd: data.information.id,
        };
        onResult(result);
        setStep("guide");
        setFrontImage(null);
        onClose();
      }
      if (data.code === 261) {
        if (data.information.id) {
          toast.success("Tải lên thẻ CCCD thành công");
          const result: IdCardToPassenger = {
            name: data.information?.name ?? "",
            gender:
              data.information.sex === "Nam"
                ? TicketGenderEnum.Male
                : TicketGenderEnum.Female,
            birthdate: data.information?.birthday ?? "",
            address: data.information?.address ?? "",
            cccd: data.information.id,
          };
          onResult(result);
          setStep("guide");
          setFrontImage(null);
          onClose();
        } else {
          toast.error(data.message);
        }
      }
      if (data.code === 400) {
        toast.error("Yêu cầu không hợp lệ");
      }
      if (data.code === 401) {
        toast.error("Không được phép truy cập");
      }
      if (data.code === 403) {
        toast.error(
          "Server nhận được dữ liệu nhưng người dùng không có quyền truy cập"
        );
      }
      if (data.code === 500) {
        toast.error("Lỗi máy chủ nội bộ");
      }
    } catch (error) {
      toast.error("Lỗi khi gửi hình ảnh");
      console.error("Lỗi khi gửi hình ảnh:", error);
    }
    setIsLoading(false);
  }, [imageFrontFile, onClose, onResult]);

  const handleRemove = useCallback(() => {
    if (step === "front") {
      setFrontImage(null);
    }
  }, [step]);

  const onGoFrontStep = useCallback(() => setStep("front"), []);

  const renderStep = useMemo(() => {
    const onInputClick = () => {
      document.getElementById("fileInput")?.click();
    };

    switch (step) {
      case "guide":
        return (
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 font-bold">Hướng dẫn tải lên thẻ CCCD</h2>
              {[
                {
                  icon: <FaIdCard className="h-8 w-8" />,
                  title: "Chuẩn bị thẻ CCCD",
                  description: "Đảm bảo thẻ CCCD của bạn sạch sẽ và dễ đọc.",
                },
                {
                  icon: <FaCamera className="h-8 w-8" />,
                  title: "Chụp ảnh mặt trước",
                  description: "Chụp ảnh rõ ràng của cả mặt trước",
                },
                {
                  icon: <FaCloudUploadAlt className="h-8 w-8" />,
                  title: "Tải lên hình ảnh",
                  description:
                    "Tải lên hình ảnh mặt trước của CCCD vào hệ thống.",
                },
              ].map((item, index) => (
                <div key={index} className="mb-4 flex items-start">
                  <div className="mr-4 mt-1 text-primary transition-all duration-200 ease-in-out">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="text-xs text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
              <Button className="mt-4 w-full" onClick={onGoFrontStep}>
                Bắt đầu
              </Button>
            </CardContent>
          </Card>
        );
      case "front":
        return (
          <Card
            className="relative border-none drop-shadow-none"
            autoFocus
            onPaste={onPaste}
          >
            <CardContent className="flex flex-col justify-center gap-2 p-2">
              {!frontImage && step === "front" ? (
                <div
                  {...getRootProps()}
                  className={`${error ? "!border-danger" : ""} cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-12 text-center`}
                >
                  <input id="fileInput" {...getInputProps()} />
                  <p className="m-0 w-full gap-2 text-center">
                    Kéo & thả hình ảnh vào đây, hoặc dán hình ảnh vào đây{" "}
                    <span className="inline-flex items-center gap-1 rounded-md border-2 border-solid border-gray-400 px-1 text-xs font-semibold text-gray-700">
                      Ctrl + V
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Tải lên mặt trước của thẻ CCCD
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Chỉ chấp nhận các định dạng JPG, JPEG và PNG
                  </p>
                  {error && <p className="mt-2 text-xs text-danger">{error}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div {...getRootProps()} className="cursor-pointer">
                    <Image
                      unoptimized
                      src={frontImage!}
                      alt="Thẻ CCCD"
                      className="mx-auto h-auto w-1/2 rounded-lg md:w-full"
                      width={300}
                      height={200}
                    />
                    <input id="fileInput" {...getInputProps()} />
                  </div>
                  <p className="text-center text-sm text-gray-500">
                    Nhấp vào hình ảnh để tải lên hình ảnh mới
                  </p>
                </div>
              )}
              <Button onClick={onInputClick} className="w-full">
                {!frontImage ? "Tải lên hình ảnh" : "Tải hình ảnh mới"}
              </Button>
            </CardContent>
            {step === "front" && frontImage && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2"
                onClick={handleRemove}
              >
                <IoCloseOutline className="h-4 w-4" />
                <span className="sr-only">Xóa hình ảnh</span>
              </Button>
            )}
          </Card>
        );
      case "submit":
        return (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-center">
                <h3 className="mb-2 text-lg font-semibold">
                  Mặt Trước Thẻ CCCD
                </h3>
                <div className="mx-auto w-1/2 md:w-full">
                  <Image
                    unoptimized
                    src={frontImage!}
                    alt="Mặt trước của thẻ CCCD"
                    className="h-auto w-full rounded-lg"
                    width={300}
                    height={200}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  }, [
    error,
    frontImage,
    getInputProps,
    getRootProps,
    handleRemove,
    onGoFrontStep,
    onPaste,
    step,
  ]);

  const onStepFrontClick = useCallback(() => setStep("front"), []);

  return isDesktop ? (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="!max-h-screen overflow-y-auto sm:max-w-[425px]"
        hideCloseButton
        ref={stepFrontRef}
        onPaste={onPaste}
      >
        <DialogHeader>
          <DialogTitle>Tải lên CCCD hoặc CMND</DialogTitle>
        </DialogHeader>
        {renderStep}
        {step !== "guide" && (
          <div className="mt-4 flex justify-end">
            {step !== "front" ? (
              <Button
                variant="outline"
                onClick={onStepFrontClick}
                className="mr-2"
                disabled={isLoading}
              >
                Quay Lại
              </Button>
            ) : (
              <Button variant="outline" onClick={onClose} className="mr-2">
                Đóng
              </Button>
            )}
            {step !== "submit" ? (
              <Button
                onClick={handleNext}
                disabled={!frontImage && step === "front"}
              >
                Tiếp Theo
              </Button>
            ) : (
              <Button
                disabled={isLoading}
                onClick={handleSubmit}
                className="flex flex-row items-center justify-center gap-2"
              >
                <span>Gửi</span>
                {isLoading && <TbLoader2 className="h-4 w-4 animate-spin" />}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent className="!flex h-full flex-col rounded-lg p-5 transition-all duration-200 ease-soft-spring md:p-10">
        <DrawerHeader>
          <DrawerTitle>Tải lên CCCD hoặc CMND</DrawerTitle>
        </DrawerHeader>
        {renderStep}
        {step !== "guide" && (
          <DrawerFooter className="flex flex-row justify-end">
            {step !== "front" ? (
              <Button
                variant="outline"
                onClick={onStepFrontClick}
                className="mr-2"
                disabled={isLoading}
              >
                Quay Lại
              </Button>
            ) : (
              <Button variant="outline" onClick={onClose} className="mr-2">
                Đóng
              </Button>
            )}
            {step !== "submit" ? (
              <Button
                onClick={handleNext}
                disabled={!frontImage && step === "front"}
                type="button"
              >
                Tiếp Theo
              </Button>
            ) : (
              <Button
                disabled={isLoading}
                onClick={handleSubmit}
                className="flex flex-row items-center justify-center gap-2"
              >
                <span>Gửi</span>
                {isLoading && <TbLoader2 className="h-4 w-4 animate-spin" />}
              </Button>
            )}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}

export default memo(IDCardUploadModal);
