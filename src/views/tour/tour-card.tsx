import Image from "next/image";
import Link from "@/components/link-base";
import type { TourCard } from "@/graphql/types";
import {
  BestSellerBadge,
  LikelyToSellOutBadge,
  FreeCancellationBadge,
} from "@/components/trust-badges";

type Props = {
  tour: TourCard;
};

const PLACEHOLDER = "/static-img/placeholder-image-500x500.png";

export default function TourCard({ tour }: Props) {
  const price = tour.shortTourInformation?.priceInUsd;
  const duration = tour.shortTourInformation?.duration;
  const imageUrl = tour.featuredImage?.node.sourceUrl ?? PLACEHOLDER;
  const imageAlt = tour.featuredImage?.node.altText ?? tour.name;
  const firstDestination = tour.destination?.nodes?.[0];
  const averageRating = tour.averageRating;
  const reviewCount = tour.reviewCount ?? 0;
  const isBestSeller = tour.productTags?.nodes?.some(
    (t) => t.slug === "best-seller"
  );
  const isLikelyToSellOut =
    !isBestSeller &&
    tour.productTags?.nodes?.some((t) => t.slug === "likely-to-sell-out");

  return (
    <Link href={`/tour/${tour.slug}/`} className="group block">
      <div className="h-full overflow-hidden rounded-2xl border bg-white shadow-card transition-all duration-300 hover:shadow-cardHover">
        {/* Image with badges */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
          {/* Location badge — top-left */}
          {firstDestination && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              {firstDestination.name}
            </span>
          )}
          {/* Duration badge — bottom-left */}
          {duration && (
            <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
              {duration}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-primary">
            {tour.name}
          </h3>

          {/* Star rating */}
          <div className="mt-2 flex items-center gap-1 text-sm">
            <span className="text-amber-500">★</span>
            <span className="font-medium">
              {averageRating ? averageRating.toFixed(1) : "New"}
            </span>
            {reviewCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({reviewCount})
              </span>
            )}
          </div>

          {/* Trust badges — seller/sell-out signals */}
          {(isBestSeller || isLikelyToSellOut) && (
            <div className="mt-1">
              {isBestSeller && <BestSellerBadge />}
              {isLikelyToSellOut && <LikelyToSellOutBadge />}
            </div>
          )}

          {/* Pricing */}
          <div className="mt-3 flex items-baseline gap-1">
            {price ? (
              <>
                <span className="text-xs text-muted-foreground">From</span>
                <span className="text-lg font-bold">${price}</span>
                <span className="text-xs text-muted-foreground">/ person</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                Contact for price
              </span>
            )}
          </div>

          {/* Free cancellation trust signal */}
          <div className="mt-2">
            <FreeCancellationBadge />
          </div>
        </div>
      </div>
    </Link>
  );
}
