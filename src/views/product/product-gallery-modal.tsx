/* eslint-disable @arthurgeron/react-usememo/require-usememo */
"use client";

import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";

import lgZoom from "lightgallery/plugins/zoom";
import lgThumbnail from "lightgallery/plugins/thumbnail";

import LightGallery from "lightgallery/react";
import { InitDetail } from "lightgallery/lg-events";
import { LightGallery as ILightGallery } from "lightgallery/lightgallery";
import { memo, useCallback, useRef } from "react";

export type GalleryItem = {
  src?: string;
  thumb?: string;
  subHtml?: string;
};

type Props = {
  images: GalleryItem[];
  startIndex: number;
  onClose: () => void;
};

const plugins = [lgZoom, lgThumbnail];

const ProductGalleryModal = ({ images, startIndex, onClose }: Props) => {
  const galleryRef = useRef<ILightGallery | null>(null);

  const onInit = useCallback(
    (detail: InitDetail) => {
      if (detail) {
        galleryRef.current = detail.instance;
        detail.instance.openGallery(startIndex);
      }
    },
    [startIndex]
  );

  const handleAfterClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <LightGallery
      onInit={onInit}
      onAfterClose={handleAfterClose}
      plugins={plugins}
      mode="lg-fade"
      dynamic
      dynamicEl={images}
      enableSwipe
      enableThumbSwipe
      enableDrag
      enableThumbDrag
    >
      <span style={{ display: "none" }} />
    </LightGallery>
  );
};

export default memo(ProductGalleryModal);
