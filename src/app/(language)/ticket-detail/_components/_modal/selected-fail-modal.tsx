import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { useTranslation } from "@/services/i18n/client";
import { memo, useEffect } from "react";
import { RiHome4Line, RiMessage3Line } from "react-icons/ri";

type Props = {
  isOpen: boolean;
  returnHandle?: () => void;
  message: string;
};

function SelectedFailModal({ isOpen, returnHandle, message }: Props) {
  const { t } = useTranslation("ticket-detail");

  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (isOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isOpen, showNav]);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="flex max-w-72 flex-col items-center justify-center gap-4 p-3 pt-8">
        <AlertDialogTitle className="hidden">Select Fail</AlertDialogTitle>
        <RiMessage3Line className="h-12 w-12" />
        <div className="text-lg font-semibold">
          {t("selected-fail-modal.chooseSeat")}{" "}
          <span className="text-danger">{t("selected-fail-modal.fail")}</span>
        </div>
        <div className="text-center text-base font-normal text-danger">
          {message}
        </div>
        <div className="text-base font-normal">
          {t("selected-fail-modal.pleaseChooseAgain")}
        </div>
        <Button
          type="submit"
          className="w-full gap-1 rounded-md px-6 py-2"
          onClick={returnHandle}
        >
          <RiHome4Line className="h-5 w-5" />
          <span>{t("selected-fail-modal.chooseAgain")}</span>
        </Button>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default memo(SelectedFailModal);
