"use client";

import {
  PropsWithChildren,
  memo,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LeavePageActionsContext,
  LeavePageContext,
  LeavePageContextParamsType,
  LeavePageInfoContext,
  LeavePageModalContext,
} from "./leave-page-context";
import { useTranslation } from "@/services/i18n/client";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LinkBase from "@/components/link-base";

function Provider({ children }: PropsWithChildren<object>) {
  const [isOpen, setIsOpen] = useState(false);
  const [leavePage, setLeavePage] = useState<LeavePageContextParamsType>(null);
  const [leavePageCounter, setIsLeavePage] = useState(0);

  const contextModalValue = useMemo(() => ({ isOpen }), [isOpen]);

  const contextValue = useMemo(
    () => ({ isLeavePage: leavePageCounter !== 0 }),
    [leavePageCounter]
  );

  const contextInfoValue = useMemo(() => ({ leavePage }), [leavePage]);

  const contextActionsValue = useMemo(
    () => ({
      trackLeavePage: () => setIsLeavePage((prevValue) => prevValue + 1),
      setLeavePage: (params: LeavePageContextParamsType) =>
        setLeavePage(params),
      untrackLeavePage: () => {
        setLeavePage(null);
        setIsLeavePage((prevValue) => prevValue - 1);
      },
      openModal: () => setIsOpen(true),
      closeModal: () => setIsOpen(false),
    }),
    []
  );

  return (
    <LeavePageContext.Provider value={contextValue}>
      <LeavePageModalContext.Provider value={contextModalValue}>
        <LeavePageActionsContext.Provider value={contextActionsValue}>
          <LeavePageInfoContext.Provider value={contextInfoValue}>
            {children}
          </LeavePageInfoContext.Provider>
        </LeavePageActionsContext.Provider>
      </LeavePageModalContext.Provider>
    </LeavePageContext.Provider>
  );
}

function Modal() {
  const { t } = useTranslation("common");
  const { isOpen } = useContext(LeavePageModalContext);
  const { leavePage } = useContext(LeavePageInfoContext);
  const { closeModal } = useContext(LeavePageActionsContext);

  const href = (leavePage?.push ?? leavePage?.replace) || "";

  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (isOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isOpen, showNav]);

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("common:leavePage.title")}</DialogTitle>
          <DialogDescription>{t("common:leavePage.message")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button variant="secondary" onClick={closeModal}>
            {t("common:leavePage.stay")}
          </Button>
          <Button asChild onClick={closeModal}>
            <LinkBase href={href} replace={!!leavePage?.replace}>
              {t("common:leavePage.leave")}
            </LinkBase>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const LeavePageProvider = memo(function LeavePageProvider({
  children,
}: PropsWithChildren<object>) {
  return (
    <Provider>
      {children}
      <Modal />
    </Provider>
  );
});

export default LeavePageProvider;
