"use client";

import LinkBase from "@/components/link-base";
import { Button } from "@/components/ui/button";
import BoxContentWrapper from "@/components/wrapper/BoxContentWrapper";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/services/i18n/client";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import React, { memo } from "react";

type Props = {
  post: Post;
};

const PostPriceSection = ({ post }: Props) => {
  const { t } = useTranslation("post/price-section");
  if (post?.productPrice?.productPrice) {
    return (
      <BoxContentWrapper className="flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">
            {formatCurrency(post?.productPrice?.productPrice[0]?.giaHienTai)}
          </div>
          <div className="text-base text-default-600 line-through">
            {formatCurrency(post?.productPrice?.productPrice[0]?.giaBanDau)}
          </div>
        </div>
        <LinkBase href={"#voyageTable"} className="w-full">
          <Button className="w-full">{t("book-online")}</Button>
        </LinkBase>
      </BoxContentWrapper>
    );
  }
  return <></>;
};

export default memo(PostPriceSection);
