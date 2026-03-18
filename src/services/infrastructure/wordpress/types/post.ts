import { Author } from "./author";
import { Category } from "./category";
import { Comments } from "./comment";
import { Destination } from "./diemDen";
import { FeaturedImage } from "./featured-image";
import { Hang } from "./hang";
import { KkStarRating } from "./kk-start-rating";
import { Seo } from "./page";
import { ProductPrice } from "./product-price";
import { Tag } from "./tag";

export type Post = {
  id: string;
  content: string;
  excerpt?: string;
  link: string;
  slug: string;
  postId: number;
  title: string;
  uri: string;
  date: string;
  authorId: string;
  author: {
    node: Author;
  };
  featuredImage?: {
    node: FeaturedImage;
  };
  tags: {
    nodes: Tag[];
  };
  hang: {
    nodes: Hang[];
  };
  diemDen: {
    nodes: Destination[];
  };
  categories: {
    nodes: Category[];
  };
  seo: Seo;
  commentCount?: number;
  comments?: Comments;
  kkStarRating: KkStarRating;
  productPrice: {
    productPrice: ProductPrice[];
  };
  baivietchuyentau: {
    routeId: number;
    isDisabled: boolean;
  };
  modified: string;
  sitemapValue: {
    priority?: number;
  };
};

export type Posts = {
  posts: { nodes: Post[] };
};

export type PostResponse = {
  post: Post;
};

export type FeaturedPosts = {
  blockCustom: {
    blockAllFields: {
      featuredPosts: FeaturedPost[];
    };
  };
};

export type FeaturedProducts = {
  blockCustom: {
    blockAllFields: {
      featuredProducts: FeaturedProduct[];
    };
  };
};

export type FeaturedPost = {
  featured_post: {
    nodes: Post[];
  };
};

export type FeaturedProduct = {
  featured_product: {
    nodes: Post[];
  };
};

export type NotifiedPost = Pick<
  Post,
  "id" | "title" | "modified" | "slug" | "featuredImage"
>;

export type NotifiedPostPostsResponse = {
  posts: { nodes: NotifiedPost[] };
};
