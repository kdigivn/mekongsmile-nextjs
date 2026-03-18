"use client";

import { buildApiPath } from "@/services/apis/build-api-path";
import { FerryTicketApiEndpoints } from "@/services/apis/endpoints";
import { useTranslation } from "@/services/i18n/client";
import { Product } from "@/services/infrastructure/wordpress/types/product";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; // Import star icons
import { toast } from "sonner";

type Props = {
  product: Product;
};

const ProductRatingSection = ({ product }: Props) => {
  const { t } = useTranslation("product/rating-section");
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);

  const [averageRating, setAverageRating] = useState<number>(
    product?.kkStarRating?.avg ?? 0
  );
  const [totalReviews, setTotalReviews] = useState<number>(
    product?.kkStarRating?.count ?? 0
  );

  const [ratings, setRatings] = useState<number>(
    product?.kkStarRating?.ratings ?? 0
  );

  const [isRated, setIsRated] = useState<boolean>(false);
  const [showStars, setShowStars] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Throttle hover to max 1 update per 100ms — prevents full re-render per pixel
  const throttleRef = useRef<number>(0);
  const handleStarHover = useCallback((rating: number) => {
    const now = Date.now();
    if (now - throttleRef.current > 100) {
      throttleRef.current = now;
      setHoverRating(rating);
    }
  }, []);

  const handleStarLeave = useCallback(() => {
    setHoverRating(null);
  }, []);

  const handleRatingSubmit = async (rating: number) => {
    if (isRated) {
      toast.info("Bạn đã đánh giá bài viết rồi!");
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const requestUrl = buildApiPath(FerryTicketApiEndpoints.cms.rating);
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: product.productId,
          rating: rating,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      if (response.status === 201) {
        const data = await response.json();
        console.log("Server response:", data);
        setUserRating(rating);
        setIsRated(true);
        setTotalReviews(totalReviews + 1);
        setRatings(ratings + rating);
        setAverageRating((ratings + rating) / (totalReviews + 1));
        // Send the rating to the server
        const localRating = localStorage.getItem(`rating`) || "{}";
        const ratingData = JSON.parse(localRating);
        ratingData[product.productId] = rating;
        localStorage.setItem(`rating`, JSON.stringify(ratingData));
        toast.success("Cảm ơn bạn đã đánh giá bài viết!");
      }
      // Optionally handle server response (e.g., show a success message)
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Đã xảy ra lỗi khi đánh giá bài viết!");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const localRating = localStorage.getItem(`rating`) || "{}";
    const ratingData = JSON.parse(localRating);
    const rating = ratingData[product.productId];
    if (rating) {
      setUserRating(rating);
      setIsRated(true);
      setTotalReviews(totalReviews + 1);
      setRatings(ratings + rating);
      setAverageRating((ratings + rating) / (totalReviews + 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.productId]);

  const renderStarIcon = (starValue: number, rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    if (hoverRating) {
      return hoverRating >= starValue ? (
        <FaStar className="text-yellow-500" />
      ) : (
        <FaRegStar className="text-yellow-500" />
      );
    }
    if (userRating) {
      return userRating >= starValue ? (
        <FaStar className="text-yellow-500" />
      ) : (
        <FaRegStar className="text-yellow-500" />
      );
    }
    if (averageRating >= starValue)
      return <FaStar className="text-yellow-500" />;
    if (hasHalfStar && starValue === fullStars + 1)
      return <FaStarHalfAlt className="text-yellow-500" />;
    return <FaRegStar className="text-yellow-500" />;
  };

  const renderStars = (rating: number) => {
    return (
      <fieldset className="m-0 border-0 p-0">
        <legend className="sr-only">{t("rate-this-product")}</legend>
        <div
          role="radiogroup"
          aria-label={t("star-rating")}
          className="flex flex-row items-center gap-1"
        >
          {[1, 2, 3, 4, 5].map((starValue) => (
            <span
              key={`star-${starValue}`}
              role="radio"
              aria-checked={userRating === starValue}
              aria-label={`${starValue} ${t("stars")}`}
              tabIndex={
                userRating === starValue || (!userRating && starValue === 1)
                  ? 0
                  : -1
              }
              className="cursor-pointer"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleRatingSubmit(starValue);
                }
                if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const next = starValue < 5 ? starValue + 1 : 1;
                  (
                    e.currentTarget.parentElement?.querySelector(
                      `[aria-posinset="${next}"]`
                    ) as HTMLElement
                  )?.focus();
                }
                if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  e.preventDefault();
                  const prev = starValue > 1 ? starValue - 1 : 5;
                  (
                    e.currentTarget.parentElement?.querySelector(
                      `[aria-posinset="${prev}"]`
                    ) as HTMLElement
                  )?.focus();
                }
              }}
              aria-posinset={starValue}
              aria-setsize={5}
              onMouseEnter={() => handleStarHover(starValue)}
              onMouseLeave={handleStarLeave}
              onClick={() => handleRatingSubmit(starValue)}
            >
              {renderStarIcon(starValue, rating)}
            </span>
          ))}
        </div>
      </fieldset>
    );
  };

  return (
    <div
      className="relative flex items-center gap-2"
      onMouseEnter={() => setShowStars(true)}
      onMouseLeave={() => setShowStars(false)}
    >
      {/* Single Star Icon to trigger hover */}
      <FaStar className="cursor-pointer text-yellow-500" aria-hidden="true" />
      <div aria-live="polite" className="sr-only">
        {userRating ? `${t("you-rated")} ${userRating} ${t("stars")}` : ""}
      </div>

      {/* Rating text */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold">
          {(userRating || averageRating).toFixed(1)}
        </span>
        <span className="text-sm">/ 5</span>
        <a
          href="#comments-section"
          className="text-sm underline hover:text-primary"
        >
          ({totalReviews} {t("đánh giá")})
        </a>
      </div>

      {/* Show 5 stars on hover */}
      {showStars && (
        <div className="absolute -top-8 left-0 rounded bg-white p-2 shadow-md">
          {renderStars(userRating || hoverRating || averageRating)}
        </div>
      )}
    </div>
  );
};

export default memo(ProductRatingSection);
