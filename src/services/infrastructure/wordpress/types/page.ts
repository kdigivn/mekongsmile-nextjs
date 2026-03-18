import { Block } from "./block";
import { Breadcrumb } from "./breadcrumb";

export type Slugs = {
  pages: {
    nodes: WordpressPageShortForSlug[];
  };
};

export type WordpressPageShortForSlug = {
  slug: string;
  isFrontPage: boolean;
  isPostsPage: boolean;
  modified: string;
  seo: {
    robots: string[];
  };
  uri: string;
  sitemapValue: {
    priority?: number;
  };
};

export type WordpressPage = {
  id: string;
  uri: string;
  title: string;
  slug: string;
  date: string;
  isFrontPage: boolean;
  isPostsPage: boolean;
  content: string;
  blocks: Block[];
  featuredImage: {
    node: {
      sourceUrl: string;
    };
  };
  seo: Seo;
};

export type Seo = {
  description: string;
  title: string;
  robots: string[];
  breadcrumbTitle: string;
  breadcrumbs: Breadcrumb[];
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    image?: {
      url: string;
      width: number;
      height: number;
      secureUrl: string;
      type: string;
    };
    locale: string;
    type: string;
    twitterMeta: {
      card: string;
      title: string;
      description: string;
      image?: string;
    };
  };
  articleMeta: {
    publishedTime: string;
    modifiedTime: string;
  };
  updatedTime: string;
  jsonLd: {
    raw: string;
  };
  focusKeywords: string[];
};

export type Page = {
  page: WordpressPage;
};
export type allPage = {
  nodes: [
    {
      id: string;
      slug: string;
      title: string;
    },
  ];
};
export type Pages = {
  pages: allPage;
};

export type WordpressPages = {
  pages: {
    nodes: WordpressPage[];
  };
};
