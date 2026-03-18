/* eslint-disable @arthurgeron/react-usememo/require-memo */
import LinkBase from "@/components/link-base";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getServerTranslation } from "@/services/i18n";
import { Product } from "@/services/infrastructure/wordpress/types/product";
import React from "react";
import ProductRatingSection from "./product-rating-section";
import { BsDot } from "react-icons/bs";
import { CiCalendar } from "react-icons/ci";
import { formatDate } from "date-fns";

type Props = {
  product: Product;
};
const ProductHeaderSection = async ({ product }: Props) => {
  const { t } = await getServerTranslation("vi", "product/header-section");

  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-3xl font-bold">{product?.title}</h1>

      <div className="flex w-full items-center justify-between gap-2">
        <ScrollArea className="h-8 flex-1">
          <div className="flex gap-2 whitespace-nowrap">
            {product?.productCategory?.nodes?.map((item, idx) => (
              <LinkBase
                key={idx}
                href={item?.uri}
                className="flex w-fit items-center justify-center rounded bg-default-300 px-2 py-1 text-sm text-black transition-all duration-200 hover:opacity-70"
              >
                {item?.name}
              </LinkBase>
            ))}

            {product?.tags?.nodes?.map((item, idx) => (
              <LinkBase
                key={idx}
                href={item?.uri}
                className="flex w-fit items-center justify-center rounded bg-default-300 px-2 py-1 text-sm text-black transition-all duration-200 hover:opacity-70"
              >
                {item?.name}
              </LinkBase>
            ))}

            {product?.hang?.nodes?.map((item, idx) => (
              <LinkBase
                key={idx}
                href={item?.uri}
                className="flex w-fit items-center justify-center rounded bg-default-300 px-2 py-1 text-sm text-black transition-all duration-200 hover:opacity-70"
              >
                {`${t("operator")}: ${item?.name}`}
              </LinkBase>
            ))}

            {product?.diemDen?.nodes?.map((item, idx) => (
              <LinkBase
                key={idx}
                href={item?.uri}
                className="flex w-fit items-center justify-center rounded bg-default-300 px-2 py-1 text-sm text-black transition-all duration-200 hover:opacity-70"
              >
                {`${t("destination")}: ${item?.name}`}
              </LinkBase>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {/* <div className="flex items-center gap-2">
          <Image
            src={product?.author?.node?.avatar?.url ?? ""}
            width={20}
            height={20}
            alt={product?.author?.node?.name}
            className="rounded-full"
          />
          <div className="text-sm">{product?.author?.node?.name}</div>
        </div> */}
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="flex flex-none items-center gap-2">
          <ProductRatingSection product={product} />
        </div>
        {product?.fakeBookNumber.fake_book_number > 0 && (
          <>
            <BsDot className="flex-none" />
            <p className="flex-none text-sm font-normal text-default-600">
              {`${product?.fakeBookNumber.fake_book_number.toLocaleString()}+ lượt mua`}
            </p>
          </>
        )}
        {product?.date && (
          <>
            <BsDot className="flex-none" />
            <div className="flex flex-none items-center gap-1 text-default-600">
              <CiCalendar />
              <p className="text-sm font-normal">
                {product?.date ? formatDate(product.date, "dd.MM.yyyy") : ""}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductHeaderSection;
