"use client";

import {
  ConfirmDialogActionsContext,
  ConfirmDialogOptions,
} from "./confirm-dialog-context";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";

function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation("confirm-dialog");

  const defaultConfirmDialogInfo = useMemo<ConfirmDialogOptions>(
    () => ({
      title: t("title"),
      message: t("message"),
      successButtonText: t("actions.yes"),
      cancelButtonText: t("actions.no"),
      hasCancelButton: true,
      cancelButtonAction: () => {},
      successButtonAction: () => {},
    }),
    [t]
  );

  const [confirmDialogInfo, setConfirmDialogInfo] =
    useState<ConfirmDialogOptions>(defaultConfirmDialogInfo);
  const resolveRef = useRef<(value: boolean) => void>(undefined);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onCancel = useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(false);
    confirmDialogInfo.cancelButtonAction();
  }, [confirmDialogInfo]);

  const onSuccess = useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(true);
    confirmDialogInfo.successButtonAction();
  }, [confirmDialogInfo]);

  const confirmDialog = useCallback(
    (options: Partial<ConfirmDialogOptions> = {}) => {
      return new Promise<boolean>((resolve) => {
        setConfirmDialogInfo({
          ...defaultConfirmDialogInfo,
          ...options,
        });
        setIsOpen(true);
        resolveRef.current = resolve;
      });
    },
    [defaultConfirmDialogInfo]
  );

  const contextActions = useMemo(
    () => ({
      confirmDialog,
    }),
    [confirmDialog]
  );

  const handleCancelClick = useCallback(() => {
    onCancel();
    handleClose();
  }, [onCancel, handleClose]);

  const handleConfirmClick = useCallback(() => {
    onSuccess();
    handleClose();
  }, [onSuccess, handleClose]);

  return (
    <>
      <ConfirmDialogActionsContext.Provider value={contextActions}>
        {children}
      </ConfirmDialogActionsContext.Provider>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader className="flex flex-col gap-1">
            <DialogTitle className="text-lg font-semibold">
              {confirmDialogInfo.title}
            </DialogTitle>
          </DialogHeader>
          <p>{confirmDialogInfo.message}</p>
          <DialogFooter>
            {confirmDialogInfo.hasCancelButton && (
              <Button variant="outline" onClick={handleCancelClick}>
                {confirmDialogInfo.cancelButtonText}
              </Button>
            )}
            <Button onClick={handleConfirmClick}>
              {confirmDialogInfo.successButtonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(ConfirmDialogProvider);
