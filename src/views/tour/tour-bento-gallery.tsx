"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type GalleryImage = { sourceUrl: string; altText: string | null };

type Props = {
  images: GalleryImage[];
};

export default function TourBentoGallery({ images }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  if (images.length === 0) return null;

  const slides = images.map((img) => ({ src: img.sourceUrl, alt: img.altText ?? "" }));

  function openAt(idx: number) {
    setSlideIndex(idx);
    setLightboxOpen(true);
  }

  const hero = images[0];
  const thumbs = images.slice(1, 5);

  return (
    <>
      {/* Desktop bento grid */}
      <div className="hidden lg:grid lg:grid-cols-4 lg:grid-rows-2 lg:gap-2 lg:rounded-2xl lg:overflow-hidden" style={{ height: 420 }}>
        {/* Hero: 2 cols x 2 rows */}
        <button
          className="col-span-2 row-span-2 relative w-full h-full overflow-hidden"
          onClick={() => openAt(0)}
          aria-label="View photo 1"
        >
          <Image
            src={hero.sourceUrl}
            alt={hero.altText ?? ""}
            fill
            sizes="(max-width: 1280px) 50vw, 640px"
            className="object-cover transition-transform hover:scale-[1.02]"
            priority
            unoptimized
          />
        </button>

        {/* 4 thumbnails */}
        {[0, 1, 2, 3].map((i) => {
          const img = thumbs[i];
          if (!img) {
            return <div key={i} className="bg-muted" />;
          }
          const isLast = i === 3 && images.length > 5;
          return (
            <button
              key={i}
              className="relative w-full h-full overflow-hidden"
              onClick={() => openAt(i + 1)}
              aria-label={`View photo ${i + 2}`}
            >
              <Image
                src={img.sourceUrl}
                alt={img.altText ?? ""}
                fill
                sizes="(max-width: 1280px) 25vw, 320px"
                className="object-cover transition-transform hover:scale-[1.02]"
                unoptimized
              />
              {isLast && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-semibold text-sm">
                  +{images.length - 5} more
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile: hero + "See all" button */}
      <div className="lg:hidden">
        <button
          className="relative w-full overflow-hidden rounded-xl"
          style={{ aspectRatio: "16/9" }}
          onClick={() => openAt(0)}
          aria-label="View photos"
        >
          <Image
            src={hero.sourceUrl}
            alt={hero.altText ?? ""}
            fill
            sizes="100vw"
            className="object-cover"
            priority
            unoptimized
          />
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              See all {images.length} photos
            </div>
          )}
        </button>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={slideIndex}
      />
    </>
  );
}
