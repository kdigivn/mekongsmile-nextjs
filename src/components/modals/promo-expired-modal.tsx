"use client";

import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { memo, useEffect, useState } from "react";
import { IoSadOutline } from "react-icons/io5";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { IoCheckmark, IoLink } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { Spinner } from "@heroui/react";
import { Voyage } from "@/services/apis/voyages/types/voyage";
import { format } from "date-fns";

interface PromoExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoBack: () => void;
  onUpdatePrice: () => void;
  voucherCode: string;
  departVoyage?: Voyage;
  returnVoyage?: Voyage;
}

/**
 * Modal displayed when user selects clickbait voyage and clicks "Create Order"
 * Shows "Promotion Expired" message + compensation voucher code
 */
const PromoExpiredModal = ({
  isOpen,
  onClose,
  onGoBack,
  onUpdatePrice,
  voucherCode,
  departVoyage,
  returnVoyage,
}: PromoExpiredModalProps) => {
  const { hideNav, showNav } = useMobileBottomNavActions();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const [isLoading, setIsLoading] = useState(false);

  // Hide mobile bottom nav when modal is open
  useEffect(() => {
    if (isOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [isOpen, hideNav, showNav]);

  const handleUpdatePrice = () => {
    setIsLoading(true);
    onUpdatePrice();
  };

  // Format voyage info: "Operator Name Departure - Destination khởi hành lúc HH:mm DD/MM/YYYY"
  const formatVoyageInfo = (voyage: Voyage) => {
    const operatorName = voyage.operator?.operator_name || "";
    const departure = voyage.route?.departure_name || "";
    const destination = voyage.route?.destination_name || "";
    // const time = voyage.depart_time;
    // const date = new Date(voyage.departure_date).toLocaleDateString("vi-VN");
    const dateTime = format(
      new Date(`${voyage.departure_date}T${voyage.depart_time}`),
      "HH:mm dd/MM/yyyy"
    );

    return `${operatorName} ${departure} - ${destination} khởi hành lúc ${dateTime}`;
  };

  // Get message based on which voyages have clickbait
  const getPromoMessage = () => {
    if (departVoyage?.clickBait && returnVoyage?.clickBait) {
      return (
        <>
          <p className="text-center text-sm leading-relaxed text-gray-600">
            Khuyến mãi giới hạn của chúng tôi dành cho:
          </p>
          <ul className="mt-2 space-y-1 text-left text-sm text-gray-600">
            <li>• Chiều đi: {formatVoyageInfo(departVoyage)}</li>
            <li>• Chiều về: {formatVoyageInfo(returnVoyage)}</li>
          </ul>
          <p className="mt-2 text-center text-sm leading-relaxed text-gray-600">
            đã hết!
          </p>
        </>
      );
    } else if (departVoyage?.clickBait) {
      return (
        <p className="text-center text-sm leading-relaxed text-gray-600">
          Khuyến mãi giới hạn của chúng tôi dành cho chuyến tàu{" "}
          <b>{formatVoyageInfo(departVoyage)}</b> đã hết!
        </p>
      );
    } else if (returnVoyage?.clickBait) {
      return (
        <p className="text-center text-sm leading-relaxed text-gray-600">
          Khuyến mãi giới hạn của chúng tôi dành cho chuyến tàu{" "}
          <b>{formatVoyageInfo(returnVoyage)}</b> đã hết!
        </p>
      );
    }

    return (
      <p className="text-center text-sm leading-relaxed text-gray-600">
        Bạn đã chậm chân mất rồi! Khuyến mãi giới hạn của chúng tôi đã hết! Chúc
        bạn may mắn lần sau!
      </p>
    );
  };

  const ModalContent = () => (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
        <IoSadOutline className="h-8 w-8 text-orange-500" />
      </div>

      <h2 className="text-center text-xl font-bold text-gray-800">
        Ôi tiếc quá! Đã hết khuyến mãi
      </h2>

      {getPromoMessage()}

      <div className="w-full rounded-lg bg-orange-50 p-4">
        <p className="mb-3 text-center text-sm font-semibold text-gray-700">
          Để đền bù, chúng tôi xin gửi bạn mã voucher:
        </p>

        <div className="flex items-center justify-between rounded-md border-2 border-dashed border-orange-300 bg-white p-3">
          <span className="flex-1 text-center font-mono text-lg font-bold text-orange-600">
            {voucherCode}
          </span>
          <button
            onClick={() => copyToClipboard(voucherCode)}
            className="ml-2 transition-all hover:scale-110"
            aria-label="Copy voucher code"
          >
            {isCopied ? (
              <IoCheckmark className="h-5 w-5 text-green-600" />
            ) : (
              <IoLink className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const FooterButtons = () => (
    <div className="flex w-full gap-2">
      <Button variant="outline" onClick={onGoBack} className="flex-1">
        Quay lại
      </Button>
      <Button
        onClick={handleUpdatePrice}
        disabled={isLoading}
        className="flex-1 bg-orange-500 hover:bg-orange-600"
      >
        <Spinner
          color="white"
          size="sm"
          className={cn("mr-1", !isLoading && "hidden")}
        />
        Cập nhật lại giá
      </Button>
    </div>
  );

  return isDesktop ? (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <ModalContent />
        <DialogFooter>
          <FooterButtons />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent>
        <ModalContent />
        <DrawerFooter>
          <FooterButtons />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default memo(PromoExpiredModal);
