"use client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { Order } from "@/services/apis/orders/types/order";
import RedirectCancelTicketRequestPageDialog from "./redirect-cancel-ticket-request-page-dialog";
import { useBoolean } from "@/hooks/use-boolean";
import ConfirmTermsStep from "./steps/confirm-term-step";
import SelectTicketsStep from "./steps/select-ticket-cancel-step";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
interface CancelTicketFlowProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  defaultStep?: number;
}

const CreateCancelTicketRequestDialog = ({
  open,
  onClose,
  order,
  defaultStep = 1,
}: CancelTicketFlowProps) => {
  const [currentStep, setCurrentStep] = useState(defaultStep || 1);
  const openRedirectDialog = useBoolean(false);
  // const { t } = useTranslation("user/cancel-ticket-request");

  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (open) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, open, showNav]);

  // Initialize form with default values

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const onCloseDialog = useCallback(() => {
    onClose();
    openRedirectDialog.onFalse();
    setCurrentStep(defaultStep || 1);
  }, [defaultStep, onClose, openRedirectDialog]);

  // const handleSuccess = useCallback(() => {
  //   onClose();
  //   openRedirectDialog.onTrue();
  // }, [onClose, openRedirectDialog]);

  // Render the current step
  const renderStep = useMemo(() => {
    if (!order) {
      return null;
    }
    switch (currentStep) {
      case 1:
        return (
          <ConfirmTermsStep
            onNext={nextStep}
            onCancel={onCloseDialog}
            order={order}
          />
        );
      case 2:
        return (
          <SelectTicketsStep
            order={order}
            onSuccess={nextStep}
            onClose={onCloseDialog}
          />
        );
      case 3:
        return (
          <RedirectCancelTicketRequestPageDialog
            open={openRedirectDialog.value}
            onClose={onCloseDialog}
            isDialog={false}
          />
        );
      default:
        return null;
    }
  }, [order, currentStep, nextStep, onCloseDialog, openRedirectDialog.value]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[100vh] max-w-lg flex-col gap-2 p-4 px-3 md:max-h-[90vh]">
        {renderStep}
      </DialogContent>
    </Dialog>
  );
};

export default memo(CreateCancelTicketRequestDialog);
