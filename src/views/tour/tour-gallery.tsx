"use client";

import { useState } from "react";
import Image from "next/image";
import type { MediaItem } from "@/graphql/types";

type Props = {
  featuredImage: MediaItem | null;
  galleryImages: MediaItem[];
  tourName: string;
};

export default function TourGallery({
  featuredImage,
  galleryImages,
  tourName,
}: Props) {
  const allImages: MediaItem[] = [];
  if (featuredImage) allImages.push(featuredImage);
  allImages.push(...galleryImages);

  const [activeIndex, setActiveIndex] = useState(0);
  const active = allImages[activeIndex];

  if (allImages.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
        <Image
          src={active?.sourceUrl ?? ""}
          alt={active?.altText ?? tourName}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
          priority
          unoptimized
        />
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.slice(0, 8).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded border-2 transition-colors ${
                idx === activeIndex
                  ? "border-primary"
                  : "border-transparent hover:border-primary/50"
              }`}
            >
              <Image
                src={img.sourceUrl}
                alt={img.altText ?? ""}
                fill
                sizes="96px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
