export type KkStarRating = {
  avg: number;
  count: number;
  ratings: number;
};

export type RatingPostData = {
  rating: number;
  post_id: number;
};

export type RatingResponse = {
  updateKKStarRating: KkStarRating;
};
