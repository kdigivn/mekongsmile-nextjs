"use client";

import LinkBase from "@/components/link-base";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/services/i18n/client";
import { useRouter } from "next/navigation";
import React, { memo, useCallback } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  isDialog?: boolean;
};

const RedirectCancelTicketRequestPageDialog = ({
  open,
  onClose,
  isDialog = true,
}: Props) => {
  const router = useRouter();
  const { t } = useTranslation("user/cancel-ticket-request");

  const handleStay = useCallback(() => {
    onClose();
    router.refresh();
  }, [onClose, router]);

  return (
    <>
      {isDialog && (
        <Dialog open={open} onOpenChange={onClose} modal>
          <DialogContent>
            <DialogTitle>
              {t("dialog.redirect-cancel-ticket-request-page-dialog.title")}
            </DialogTitle>

            <DialogFooter>
              <Button variant="outline" onClick={handleStay}>
                {t(
                  "dialog.redirect-cancel-ticket-request-page-dialog.buttons.stay"
                )}
              </Button>
              <LinkBase href={`/user/cancel-ticket-request`}>
                <Button variant={"default"}>
                  {t(
                    "dialog.redirect-cancel-ticket-request-page-dialog.buttons.redirect"
                  )}
                </Button>
              </LinkBase>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {!isDialog && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">
            {t("dialog.redirect-cancel-ticket-request-page-dialog.title")}
          </h2>
          <p>
            {t("dialog.redirect-cancel-ticket-request-page-dialog.description")}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              {t(
                "dialog.redirect-cancel-ticket-request-page-dialog.buttons.stay"
              )}
            </Button>
            <LinkBase href={`/user/cancel-ticket-request`}>
              <Button variant={"default"}>
                {t(
                  "dialog.redirect-cancel-ticket-request-page-dialog.buttons.redirect"
                )}
              </Button>
            </LinkBase>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(RedirectCancelTicketRequestPageDialog);
