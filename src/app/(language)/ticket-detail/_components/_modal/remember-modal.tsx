import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { useTranslation } from "@/services/i18n/client";
import useLanguage from "@/services/i18n/use-language";
import { Image } from "@heroui/react";
import { memo, useCallback, useEffect } from "react";

type Props = {
  isOpen: boolean;
  onRemember: (value: number) => void;
  onOpenChange: (isOpen: boolean) => void;
};

function RememberModal({ isOpen, onRemember, onOpenChange }: Props) {
  const { t } = useTranslation("ticket-detail");

  const handleRemember = useCallback(() => {
    onRemember(1);
  }, [onRemember]);

  const handleNotRemember = useCallback(() => {
    onRemember(0);
  }, [onRemember]);

  const handleAlwayRemember = useCallback(() => {
    onRemember(2);
  }, [onRemember]);

  const language = useLanguage();

  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (isOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isOpen, showNav]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-[440px] flex-col items-center justify-center gap-4 p-3 pt-8">
        <DialogTitle className="text-lg font-semibold transition-all duration-200 ease-in-out">
          {t("confirm_save_info")}
        </DialogTitle>
        <div className="text-center text-sm font-normal">
          {t("save_info_prompt")}
        </div>
        {/* <Skeleton className="h-[250px] w-full gap-1 rounded-md" /> */}
        <Image
          src={`/static-img/autofill-instruction-${language}.gif`}
          // width={300}
          height={250}
          className="w-full gap-1 rounded-md shadow-md"
          alt="instruction"
        />
        <div className="flex w-full flex-col-reverse flex-wrap gap-2 md:flex-row md:justify-center">
          <Button
            type="submit"
            variant={"outline"}
            className="flex-1 gap-1 rounded-md px-6 py-2 md:flex-none"
            onClick={handleNotRemember}
          >
            {t("decline")}
          </Button>
          <Button
            type="submit"
            variant={"outline"}
            className="flex-1 gap-1 rounded-md px-6 py-2 md:flex-none"
            onClick={handleRemember}
          >
            {t("only_this_time")}
          </Button>
          <Button
            type="submit"
            className="flex-1 gap-1 rounded-md px-6 py-2 md:flex-none"
            onClick={handleAlwayRemember}
          >
            {t("always_agree")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(RememberModal);
