/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { buildApiPath } from "@/services/apis/build-api-path";
import { FerryTicketApiEndpoints } from "@/services/apis/endpoints";
import { useTranslation } from "@/services/i18n/client";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import { memo, useEffect, useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; // Import star icons
import { toast } from "sonner";

type Props = {
  post: Post;
};

const RatingSection = ({ post }: Props) => {
  const { t } = useTranslation("post/rating-section");
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(
    post?.kkStarRating?.avg ?? 0
  );
  const [totalReviews, setTotalReviews] = useState<number>(
    post?.kkStarRating?.count ?? 0
  );
  const [ratings, setRatings] = useState<number>(
    post?.kkStarRating?.ratings ?? 0
  );
  const [isRated, setIsRated] = useState<boolean>(false);
  const [showStars, setShowStars] = useState<boolean>(false); // Show 5 stars on hover

  const handleRatingSubmit = async (rating: number) => {
    if (isRated) {
      toast.info("Bạn đã đánh giá bài viết rồi!");
      return;
    }

    try {
      const requestUrl = buildApiPath(FerryTicketApiEndpoints.cms.rating);
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: post.postId,
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

        const localRating = localStorage.getItem(`rating`) || "{}";
        const ratingData = JSON.parse(localRating);
        ratingData[post.postId] = rating;
        localStorage.setItem(`rating`, JSON.stringify(ratingData));

        toast.success("Cảm ơn bạn đã đánh giá bài viết!");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Đã xảy ra lỗi khi đánh giá bài viết!");
    }
  };

  useEffect(() => {
    const localRating = localStorage.getItem(`rating`) || "{}";
    const ratingData = JSON.parse(localRating);
    const rating = ratingData[post.postId];
    if (rating) {
      setUserRating(rating);
      setIsRated(true);
      setTotalReviews(totalReviews + 1);
      setRatings(ratings + rating);
      setAverageRating((ratings + rating) / (totalReviews + 1));
    }
  }, [post.postId]);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex flex-row items-center gap-1">
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;

          return (
            <span
              key={`star-${i}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => handleRatingSubmit(starValue)}
            >
              {hoverRating ? (
                hoverRating >= starValue ? (
                  <FaStar className="text-yellow-500" />
                ) : (
                  <FaRegStar className="text-yellow-500" />
                )
              ) : userRating ? (
                userRating >= starValue ? (
                  <FaStar className="text-yellow-500" />
                ) : (
                  <FaRegStar className="text-yellow-500" />
                )
              ) : averageRating >= starValue ? (
                <FaStar className="text-yellow-500" />
              ) : hasHalfStar && starValue === fullStars + 1 ? (
                <FaStarHalfAlt className="text-yellow-500" />
              ) : (
                <FaRegStar className="text-yellow-500" />
              )}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="relative flex items-center gap-2"
      onMouseEnter={() => setShowStars(true)}
      onMouseLeave={() => setShowStars(false)}
    >
      {/* Single Star Icon to trigger hover */}
      <FaStar className="cursor-pointer text-yellow-500" />

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

export default memo(RatingSection);
