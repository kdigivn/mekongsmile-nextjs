"use client";

import { createContext } from "react";

export type ConfirmDialogOptions = {
  title: string;
  message: string;
  successButtonText: string;
  cancelButtonText?: string;
  hasCancelButton: boolean;
  successButtonAction: () => void;
  cancelButtonAction: () => void;
};

export const ConfirmDialogActionsContext = createContext<{
  confirmDialog: ({
    title,
    message,
    successButtonText,
    cancelButtonText,
    hasCancelButton,
    successButtonAction,
    cancelButtonAction,
  }?: Partial<ConfirmDialogOptions>) => Promise<boolean>;
}>({
  confirmDialog: () => Promise.resolve(false),
});
