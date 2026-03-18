/* eslint-disable @arthurgeron/react-usememo/require-usememo */
"use client";

// Base gallery CSS kept in initial bundle to prevent FOUC (~5KB gzipped)
import "lightgallery/css/lightgallery.css";

import { Product } from "@/services/infrastructure/wordpress/types/product";
import React, { memo, useMemo, useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IoPlay } from "react-icons/io5";
import { useTranslation } from "@/services/i18n/client";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import Image from "next/image";
import { Modal, ModalContent } from "@heroui/react";
import FacebookReelEmbed from "@/components/social-sharing/facebook-reel-embed";
import dynamic from "next/dynamic";

// Tiny SVG placeholder for blur effect while product hero image loads
const PRODUCT_BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI5Ij48cmVjdCBmaWxsPSIjMWEzNjVkIiB3aWR0aD0iMTYiIGhlaWdodD0iOSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+";

// Module-scope dynamic import — defers ~85-110KB gzipped until user clicks gallery
const ProductGalleryModal = dynamic(() => import("./product-gallery-modal"), {
  ssr: false,
});

type Props = {
  product: Product;
};

const ProductSlideSection = ({ product }: Props) => {
  const { t } = useTranslation("product/slide-section");

  const [openVideoDialog, setOpenVideoDialog] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (openVideoDialog) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, openVideoDialog, showNav]);

  const handleOpenVideoDialog = useCallback(() => {
    setOpenVideoDialog(true);
  }, []);

  const openGallery = useCallback((index: number) => {
    setGalleryStartIndex(index);
    setGalleryOpen(true);
  }, []);

  const closeGallery = useCallback(() => {
    setGalleryOpen(false);
  }, []);

  // Prepare gallery items dynamically
  const dynamicGalleryItems = useMemo(
    () =>
      product?.productSlideImages?.productSlideImages?.nodes.map((item) => ({
        src: item?.sourceUrl,
        thumb: item?.sourceUrl,
        subHtml: `
            <p><strong>${item.caption ? item.caption : ""}</strong></p>
            <p>${item.title}</p>
            `,
      })),
    [product?.productSlideImages?.productSlideImages?.nodes]
  );

  return (
    <div
      className="flex w-full gap-1"
      role="region"
      aria-label="Product image gallery"
    >
      <div className="relative w-full lg:w-9/12">
        <Image
          src={
            ((product?.featuredImage?.node?.sourceUrl ??
            (product?.productSlideImages?.productSlideImages?.nodes[0] &&
              product?.productSlideImages?.productSlideImages?.nodes[0]
                .sourceUrl))
              ? product?.productSlideImages?.productSlideImages?.nodes[0]
                  .sourceUrl
              : "/static-img/mekongsmile-placeholder-1920x1080.png") ??
            "/static-img/mekongsmile-placeholder-1920x1080.png"
          }
          unoptimized
          alt={
            product?.productSlideImages?.productSlideImages?.nodes[0] &&
            product?.productSlideImages?.productSlideImages?.nodes[0].altText
              ? product?.productSlideImages?.productSlideImages?.nodes[0]
                  .altText
              : ""
          }
          className="object-fit aspect-video w-full rounded-r-lg rounded-s-xl hover:cursor-pointer lg:rounded-r-none"
          sizes="(max-width: 1023px) 100vw, 897px"
          height={505}
          width={897}
          priority
          placeholder="blur"
          blurDataURL={PRODUCT_BLUR_PLACEHOLDER}
        />
        <div
          className="absolute left-0 top-0 z-10 h-full w-full bg-default-100/20 hover:cursor-pointer"
          onClick={handleOpenVideoDialog}
        >
          <div className="absolute left-[47%] top-[45%]">
            <Button className="h-12 w-12 rounded-full" aria-label="Watch video">
              <IoPlay />
            </Button>
          </div>
          <div className="visible absolute left-[65%] top-[77%] z-20 md:left-[80%] md:top-[87%] lg:hidden">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                openGallery(0);
              }}
            >
              {t("gallery")}
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden flex-col gap-1 lg:flex lg:w-3/12">
        <div className="h-full w-full !rounded-br-xl hover:cursor-pointer">
          <Image
            src={
              product?.productSlideImages?.productSlideImages?.nodes[1] &&
              product?.productSlideImages?.productSlideImages?.nodes[1]
                .sourceUrl
                ? product?.productSlideImages?.productSlideImages?.nodes[1]
                    .sourceUrl
                : "/static-img/condao.express-Logo-500x500.png"
            }
            alt={
              product?.productSlideImages?.productSlideImages?.nodes[1] &&
              product?.productSlideImages?.productSlideImages?.nodes[1].altText
                ? product?.productSlideImages?.productSlideImages?.nodes[1]
                    .altText
                : ""
            }
            className="h-full w-full !rounded-tr-xl object-cover hover:cursor-pointer"
            onClick={() => openGallery(1)}
            width={300}
            height={250}
            loading="lazy"
            unoptimized
          />
        </div>

        <div className="bg-grey/30 relative h-full w-full">
          <div className="h-full w-full !rounded-br-xl hover:cursor-pointer">
            <Image
              src={
                product?.productSlideImages?.productSlideImages?.nodes[2] &&
                product?.productSlideImages?.productSlideImages?.nodes[2]
                  .sourceUrl
                  ? product?.productSlideImages?.productSlideImages?.nodes[2]
                      .sourceUrl
                  : "/static-img/condao.express-Logo-500x500.png"
              }
              alt={
                product?.productSlideImages?.productSlideImages?.nodes[2] &&
                product?.productSlideImages?.productSlideImages?.nodes[2]
                  .altText
                  ? product?.productSlideImages?.productSlideImages?.nodes[2]
                      .altText
                  : ""
              }
              className="h-full w-full !rounded-br-xl object-cover hover:cursor-pointer"
              onClick={() => openGallery(2)}
              height={300}
              width={250}
              loading="lazy"
              unoptimized
            />
          </div>
          <div className="absolute left-[50%] top-[80%] z-10">
            <Button
              id="button-gallery-state"
              aria-label={t("gallery")}
              onClick={() => openGallery(0)}
            >
              {t("gallery")}
            </Button>
          </div>
        </div>
      </div>

      {/* LightGallery — loaded on demand when user clicks gallery */}
      {galleryOpen && dynamicGalleryItems && (
        <ProductGalleryModal
          images={dynamicGalleryItems}
          startIndex={galleryStartIndex}
          onClose={closeGallery}
        />
      )}

      {/* Section: Video dialog */}
      <Modal
        isOpen={openVideoDialog}
        onOpenChange={setOpenVideoDialog}
        size="5xl"
        backdrop="opaque"
      >
        <ModalContent>
          <div className="h-10/12 flex items-center justify-center py-4 md:h-[85vh] md:w-full">
            {product?.productSlideVideo?.productSlideVideo?.includes(
              "facebook.com/reel"
            ) ? (
              <FacebookReelEmbed
                reelUrl={product?.productSlideVideo?.productSlideVideo ?? ""}
              />
            ) : (
              <iframe
                src={product?.productSlideVideo?.productSlideVideo ?? ""}
                allow="autoplay"
                className="h-[75vh] w-full"
              />
            )}
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default memo(ProductSlideSection);
