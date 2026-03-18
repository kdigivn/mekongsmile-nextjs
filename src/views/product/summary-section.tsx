"use client";

import React, { memo, useCallback, useEffect, useState } from "react";
import { ProductProps } from "./detail-product-section";
import BoxContentWrapper from "@/components/wrapper/BoxContentWrapper";
// eslint-disable-next-line no-restricted-imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/services/i18n/client";
import {
  countHtmlDomParser,
  getHtmlDomParser,
  isEmptyString,
  removeSquareBracketsInExcerpt,
} from "@/lib/utils";
import { MdOutlineArrowForward } from "react-icons/md";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import { Skeleton } from "@/components/ui/skeleton";

const ProductSummarySection = ({ product }: ProductProps) => {
  const { t } = useTranslation("product/summary-section");
  const isSSR = typeof window === "undefined";

  const [openSummaryDialog, setOpenSummaryDialog] = useState(false);
  const [isViewMoreSummary, setIsViewMoreSummary] = useState<boolean>();
  const [summaryContentRender, setSummaryContentRender] = useState<string>();

  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (openSummaryDialog) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, openSummaryDialog, showNav]);

  /**
   * Handles opening the summary dialog by setting the state to true.
   * This function is memoized using useCallback to prevent unnecessary
   * re-creation on every render, improving performance when passed
   * as a prop to child components.
   */
  const handleOpenSummaryDialog = useCallback(() => {
    setOpenSummaryDialog(true);
  }, []);

  useEffect(() => {
    if (isSSR) return;
    const domNumber = countHtmlDomParser(
      removeSquareBracketsInExcerpt(product?.excerpt ?? ""),
      "p"
    );

    if (domNumber > 3) {
      setIsViewMoreSummary(true);
    } else {
      setIsViewMoreSummary(false);
    }

    setSummaryContentRender(
      getHtmlDomParser(
        removeSquareBracketsInExcerpt(product?.excerpt ?? ""),
        "p",
        3
      )
    );
  }, [isSSR, product?.excerpt]);

  if (isEmptyString(product?.excerpt ?? "")) {
    return <></>;
  }

  return summaryContentRender ? (
    <BoxContentWrapper className="w-full flex-row justify-between gap-4">
      <div className="flex flex-col gap-4">
        <div
          className="flex flex-col gap-2"
          dangerouslySetInnerHTML={{ __html: summaryContentRender ?? "" }}
        />

        {isViewMoreSummary ? (
          <div
            onClick={handleOpenSummaryDialog}
            className="flex cursor-pointer items-center gap-2 font-medium transition duration-250 ease-in-out hover:underline"
          >
            <div>{t("view-more")}</div>
            <MdOutlineArrowForward size={20} />
          </div>
        ) : (
          <Skeleton className="flex w-full cursor-pointer items-center gap-2 bg-neutral-200 font-medium transition duration-250 ease-in-out hover:underline" />
        )}
      </div>
      {/* <div className="flex w-10 flex-none items-end md:w-16">
        <Image
          src={"/static-img/summary-section-img.png"}
          alt={"Summary image"}
          width={150}
          height={150}
          loading="lazy"
          className="aspect-square rounded-none object-contain"
        />
      </div> */}

      <Dialog open={openSummaryDialog} onOpenChange={setOpenSummaryDialog}>
        <DialogContent className="max-w-md md:max-w-xl">
          <DialogHeader>
            <DialogTitle>{product?.title}</DialogTitle>
          </DialogHeader>
          <div
            className="flex flex-col gap-2"
            dangerouslySetInnerHTML={{
              __html: removeSquareBracketsInExcerpt(product?.excerpt ?? ""),
            }}
          />
        </DialogContent>
      </Dialog>
    </BoxContentWrapper>
  ) : (
    <Skeleton className="h-[186px] w-full rounded-md bg-neutral-200 md:h-[138px] lg:h-[114px]" />
  );
};

export default memo(ProductSummarySection);
