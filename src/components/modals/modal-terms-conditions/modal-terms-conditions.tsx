import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import LinkBase from "@/components/link-base";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

type Props = {
  isOpen: boolean;
  isTermAgree: boolean;
  termsConditionsContent: string;
  termsConditionsUrl: string;
  onClose: () => void;
  onAgree: () => void;
  onDisagree: () => void;
};
function ModalTermsConditions({
  isOpen,
  onClose,
  isTermAgree,
  termsConditionsContent,
  termsConditionsUrl,
  onAgree,
  onDisagree,
}: Props) {
  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (isOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isOpen, showNav]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-full px-4 sm:max-w-[425px] md:h-2/3 md:max-w-[750px]">
        <DialogTitle>Điều khoản và Điều kiện</DialogTitle>
        <DialogDescription className="sr-only">
          Vui lòng xem kĩ Điều khoản và Điều kiện của chúng tôi
        </DialogDescription>
        <ScrollArea type={"auto"} className="h-full w-full">
          <div
            className="post-detail p-1"
            dangerouslySetInnerHTML={{
              __html: termsConditionsContent,
            }}
          />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <DialogFooter className="flex gap-2">
          <LinkBase
            href={termsConditionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full sm:w-auto"
            )}
          >
            Chi tiết
          </LinkBase>
          {isTermAgree ? (
            <Button onClick={onDisagree} variant={"destructive"}>
              Không đồng ý
            </Button>
          ) : (
            <Button onClick={onAgree}>Đồng ý</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModalTermsConditions;
