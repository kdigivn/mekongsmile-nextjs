import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/services/i18n/client";
import { AccordionContent, AccordionTrigger } from "@radix-ui/react-accordion";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { GoDotFill } from "react-icons/go";
import * as XLSX from "xlsx";

type Props = {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onImportButtonClicked?: () => void;
  onDownloadTemplateButtonClicked?: () => void;
  onHandleFileData: (
    fileData: string[][],
    utils: {
      setTotalRecord: React.Dispatch<React.SetStateAction<number>>;
      setCurrentProgress: React.Dispatch<React.SetStateAction<number>>;
      setErrorMessages: React.Dispatch<React.SetStateAction<string[]>>;
    }
  ) => void;
};
function ImportPassengersModal({
  isOpen,
  onOpenChange,
  onDownloadTemplateButtonClicked,
  onImportButtonClicked,
  onHandleFileData,
}: Props) {
  const { t } = useTranslation("ticket-detail");
  const { hideNav, showNav } = useMobileBottomNavActions();

  const [totalRecord, setTotalRecord] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(-1);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      hideNav();
    } else {
      // reset state when modal close
      resetData();
      showNav();
    }
  }, [hideNav, isOpen, showNav]);

  const resetData = () => {
    setErrorMessages([]);
    setCurrentProgress(-1);
    setTotalRecord(0);
  };

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Handle the file here, e.g., read its contents
        const wb = XLSX.read(await file.arrayBuffer());

        // Data is an array of arrays extracted from the sheet
        const data: [] = XLSX.utils
          .sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
            header: 1,
          })
          .slice(2) as [];

        onHandleFileData(data, {
          setTotalRecord,
          setCurrentProgress,
          setErrorMessages,
        });
      }
    },
    [onHandleFileData]
  );

  const handleImportButtonClicked = useCallback(() => {
    // Clear old file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();

      if (onImportButtonClicked) onImportButtonClicked();
    }
    // and reset data
    resetData();
  }, [onImportButtonClicked]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        forceMount
        aria-describedby={undefined} // remove missing description warning
      >
        <DialogHeader>
          <DialogTitle>{t("import-modal.title")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-start justify-start gap-3">
          <span className="text-sm font-semibold">
            {t("import-modal.step1")}
          </span>
          <Button
            // asChild
            className="rounded-md"
            type="button"
            onClick={onDownloadTemplateButtonClicked}
          >
            {t("passenger-details.downloadTemplate")}
          </Button>
        </div>
        <div className="flex flex-col items-start justify-start gap-3">
          <span className="text-sm font-semibold">
            {t("import-modal.step2")}
          </span>
          <span className="text-xs font-normal">
            {t("import-modal.step2-1")}
          </span>
        </div>
        <div className="flex flex-col items-start justify-start gap-3">
          <span className="text-sm font-semibold">
            {t("import-modal.step3")}
          </span>
          <div className="flex flex-row justify-start gap-3">
            <Button
              className="flex gap-1 rounded-md"
              type="button"
              onClick={handleImportButtonClicked}
            >
              {t("import-modal.import")}
              <input
                className="hidden"
                ref={fileInputRef}
                type="file"
                id="import-file"
                accept=".xls"
                onChange={handleFileChange}
              />
            </Button>
            {totalRecord > 0 && currentProgress > -1 && (
              <>
                <span className="flex flex-row items-center gap-1 text-xs">
                  <span
                    className={`${currentProgress === totalRecord ? "text-success" : "text-warning"}`}
                  >
                    <GoDotFill />
                  </span>
                  {t("import-modal.import-passenger")} {currentProgress}/
                  {totalRecord}
                </span>
              </>
            )}
          </div>
          {errorMessages.length !== 0 && (
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="error">
                <AccordionTrigger className="m-0 pt-0 text-sm hover:no-underline">
                  {t("import-modal.view-detail-error")}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-1">
                    {errorMessages.map((error, index) => (
                      <p
                        key={index}
                        className="flex flex-row items-center gap-1 text-xs text-danger"
                      >
                        <GoDotFill />
                        {error}
                      </p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(ImportPassengersModal);
