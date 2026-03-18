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

export type Product = {
  id: string;
  content: string;
  excerpt: string;
  link: string;
  slug: string;
  productId: number;
  title: string;
  uri: string;
  date: string;
  authorId: string;
  author: {
    node: Author;
  };
  featuredImage: {
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
  productCategory: {
    nodes: Category[];
  };
  seo: Seo;
  commentCount?: number;
  comments?: Comments;
  productSlideImages?: {
    productSlideImages?: {
      nodes: ProductSlideImage[];
    };
  };
  productSlideVideo?: {
    productSlideVideo?: string;
  };
  kkStarRating: KkStarRating;
  productPrice: {
    productPrice: ProductPrice[];
  };
  vetau: {
    routeid: number;
    notice: string;
    isdisabled: boolean;
  };
  fakeBookNumber: {
    fake_book_number: number;
  };
};

export type ProductSlideImage = {
  id: string;
  altText?: string;
  caption?: string;
  date?: string;
  description?: string;
  link?: string;
  sourceUrl?: string;
  title?: string;
};

export type Products = {
  products: { nodes: Product[] };
};

export type ProductResponse = {
  product: Product;
};

export type ProductSlugResponse = {
  allProduct: {
    nodes: {
      slug: string;
      uri: string;
      modified: string;
      seo: {
        robots: string[];
      };
      sitemapValue: {
        priority?: number;
      };
    }[];
  };
};

export type ProductByPostResponse = {
  post: {
    hang: {
      nodes: [{ product: { nodes: Product[] } }];
    };
    diemDen: {
      nodes: [{ product: { nodes: Product[] } }];
    };
  };
  product: {
    hang: {
      nodes: [{ product: { nodes: Product[] } }];
    };
    diemDen: {
      nodes: [{ product: { nodes: Product[] } }];
    };
  };
};
