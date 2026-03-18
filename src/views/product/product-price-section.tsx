"use client";

import LinkBase from "@/components/link-base";
import RouteDisabledPopup from "@/components/popup/route-disabled-popup";
import { Button } from "@/components/ui/button";
import BoxContentWrapper from "@/components/wrapper/BoxContentWrapper";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/services/i18n/client";
import { Product } from "@/services/infrastructure/wordpress/types/product";
import React, { memo, useCallback, useEffect, useState } from "react";
import { LuShoppingCart } from "react-icons/lu";

type Props = {
  product: Product;
};

const ProductPriceSection = ({ product }: Props) => {
  const { t } = useTranslation("product/price-section");

  const [isOpen, setIsOpen] = useState(false);
  const onClose = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (product.vetau.isdisabled) {
      setTimeout(() => {
        setIsOpen(true);
      }, 5000);
    }
  }, [product.vetau.isdisabled]);

  if (product?.productPrice?.productPrice) {
    return (
      <>
        <BoxContentWrapper className="flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              {formatCurrency(
                product?.productPrice?.productPrice[0]?.giaHienTai
              )}
            </div>
            <div className="text-base text-default-600 line-through">
              {formatCurrency(
                product?.productPrice?.productPrice[0]?.giaBanDau
              )}
            </div>
          </div>
          <LinkBase href={"#voyageTable"} className="w-full">
            <Button className="w-full gap-2" aria-label={t("book-online")}>
              <LuShoppingCart className="h-5 w-5" aria-hidden="true" />
              <span>{t("book-online")}</span>
            </Button>
          </LinkBase>
        </BoxContentWrapper>
        <RouteDisabledPopup isOpen={isOpen} onClose={onClose} />
      </>
    );
  }
  return (
    <>
      <RouteDisabledPopup isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default memo(ProductPriceSection);
