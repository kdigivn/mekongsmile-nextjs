"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "@/services/i18n/client";
import { Product } from "@/services/infrastructure/wordpress/types/product";
import { SideBarItem } from "@/services/infrastructure/wordpress/types/sideBar";
import React, { useMemo } from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import ContactFormSection from "./contact-form-section";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import Image from "next/image";

type Props = {
  sideBarItem: SideBarItem;
  product: Product | Post;
};
function SideBarAccordionSection({ sideBarItem, product }: Props) {
  const { t } = useTranslation("post/post-accordion");
  const defaultValue = useMemo(() => ["item-2"], []);

  return (
    <Accordion
      type="multiple"
      className="flex w-full flex-col gap-4"
      defaultValue={defaultValue}
    >
      <AccordionItem
        value="item-1"
        className="flex flex-col gap-2 rounded-lg border-none bg-white p-4"
      >
        <AccordionTrigger className="p-0 hover:no-underline">
          <div className="ite grid w-full grid-cols-12 gap-2">
            <div className="z-10 col-span-2 flex items-center justify-center">
              <Image
                src={sideBarItem.logo.node.sourceUrl ?? ""}
                alt={`${sideBarItem.name} logo`}
                className="h-5 w-auto rounded-none object-cover p-1"
                width={20}
                height={40}
                loading="lazy"
                unoptimized
              />
            </div>
            <div className="col-span-10 w-full text-start text-sm font-semibold">
              {sideBarItem.label ?? t("invalid.label")}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-0">
          {sideBarItem?.qrImage ? (
            <div className="grid grid-cols-3 place-items-center gap-2 pb-0">
              <div className="post-detail list-style col-span-2">
                <div
                  dangerouslySetInnerHTML={{
                    __html: sideBarItem.description ?? "",
                  }}
                />
              </div>
              <Image
                src={sideBarItem.qrImage.node.sourceUrl}
                alt="QR Code"
                width={200}
                height={200}
                className="col-span-1 aspect-square object-contain"
                loading="lazy"
                unoptimized
              />
            </div>
          ) : (
            t("invalid.noQR")
          )}
        </AccordionContent>
      </AccordionItem>

      <ContactFormSection post={product} />

      {"vetau" in product && product?.vetau.notice && (
        <AccordionItem
          value="item-2"
          className="flex flex-col gap-2 rounded-lg border-none bg-white p-4"
        >
          <AccordionTrigger className="p-0 hover:no-underline">
            <div className="ite grid w-full grid-cols-12 gap-2">
              <div className="z-10 col-span-2 flex items-center justify-center">
                <IoInformationCircleOutline className="h-6 w-6" />
              </div>
              <div className="col-span-10 w-fit text-sm font-semibold">
                {t("notice")}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0">
            <div className="list-style flex items-center justify-center">
              <div
                dangerouslySetInnerHTML={{
                  __html: product.vetau?.notice ?? "",
                }}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}

export default SideBarAccordionSection;
