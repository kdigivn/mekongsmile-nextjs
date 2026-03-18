/**
 * TypeScript types for mekongsmile.com GraphQL schema
 *
 * Generated manually based on live schema introspection.
 * For auto-generation, use GraphQL Code Generator with:
 *   npx graphql-codegen --config codegen.ts
 */

// ─── Media ────────────────────────────────────────────────────────────────────

export interface MediaItem {
  sourceUrl: string;
  altText: string | null;
  title: string | null;
  mediaDetails?: {
    width: number | null;
    height: number | null;
  };
}

export interface FeaturedImage {
  node: MediaItem;
}

// ─── Taxonomy: Destination ────────────────────────────────────────────────────

export interface Destination {
  databaseId: number;
  name: string;
  slug: string;
  uri: string | null;
  count: number | null;
  description: string | null;
  parent?: {
    node: {
      databaseId: number;
      name: string;
      slug: string;
    };
  } | null;
  children?: {
    nodes: DestinationChild[];
  };
}

export interface DestinationChild {
  databaseId: number;
  name: string;
  slug: string;
  uri?: string | null;
  count: number | null;
  description?: string | null;
}

// ─── Taxonomy: Tour Type & Travel Style ───────────────────────────────────────

export interface TaxonomyTerm {
  databaseId: number;
  name: string;
  slug: string;
  count: number | null;
}

export type TourType = TaxonomyTerm; // group-tour, private-tour
export type TravelStyle = TaxonomyTerm; // culinary-tours, cultural-tours, etc.
export type ProductTag = TaxonomyTerm;

// ─── Taxonomy: Post Category ──────────────────────────────────────────────────

export interface Category {
  databaseId: number;
  name: string;
  slug: string;
  uri: string | null;
  count: number | null;
  parent?: {
    node: {
      databaseId: number;
      name: string;
      slug: string;
    };
  } | null;
  children?: {
    nodes: Array<{
      databaseId: number;
      name: string;
      slug: string;
      count: number | null;
    }>;
  };
}

// ─── ACF: Short Tour Information ──────────────────────────────────────────────

export interface ShortTourInformation {
  priceInUsd: number | null;
  priceInVnd: number | null;
  duration: string | null;
  language: string | null;
  bestTimeToVisit: string | null;
  destinations: string | null; // Text field (not taxonomy reference)
  tripadvisorLink: string | null;
  highlights: string | null; // HTML/WYSIWYG
  additionalInfo: string | null; // HTML/WYSIWYG
  pricingTable: number | null;
  faq: ShortTourFaq[] | null;
  includes: {
    included: string | null; // HTML
    excluded: string | null; // HTML
  } | null;
  meetingPickup: {
    pickupPoint: string | null;
    startTime: string | null;
    pickupDetails: string | null;
    linkGoogleMaps: string | null;
  } | null;
  attachment: {
    node: MediaItem;
  } | null;
}

export interface ShortTourFaq {
  question: string | null;
  answer: string | null;
}

// ─── ACF: Tour Constant (Options Page) ───────────────────────────────────────

export interface TourConstantWhyChooseUs {
  headline: string | null;
  description: string | null;
}

export interface TourConstant {
  whyChooseUs: TourConstantWhyChooseUs[] | null;
}

// ─── SEO (Rank Math) ──────────────────────────────────────────────────────────

export interface SeoOpenGraphImage {
  url: string;
  width: number | null;
  height: number | null;
  type: string | null;
}

export interface SeoOpenGraph {
  title: string | null;
  description: string | null;
  url: string | null;
  type: string | null;
  siteName: string | null;
  image: SeoOpenGraphImage | null;
}

export interface SeoBreadcrumb {
  text: string;
  url: string;
  isHome: boolean;
}

export interface SeoData {
  title: string | null;
  description: string | null;
  focusKeywords: string[] | null;
  robots: string[] | null;
  canonical: string | null;
  breadcrumbs: SeoBreadcrumb[] | null;
  openGraph: SeoOpenGraph | null;
  jsonLd: { raw: string } | null;
}

// ─── Tour (Product) ──────────────────────────────────────────────────────────

export interface TourCard {
  databaseId: number;
  name: string;
  slug: string;
  uri: string;
  shortDescription: string | null;
  featuredImage: FeaturedImage | null;
  destination: { nodes: Destination[] };
  allPaTourType: { nodes: TourType[] };
  allPaTravelStyle: { nodes: TravelStyle[] };
  productTags: { nodes: ProductTag[] };
  shortTourInformation?: {
    priceInUsd: number | null;
    priceInVnd: number | null;
    duration: string | null;
  };
}

export interface TourDetail extends TourCard {
  seo?: SeoData;
  description: string | null; // Full HTML
  content: string | null; // Full HTML
  galleryImages: { nodes: MediaItem[] };
  image: MediaItem | null;
  shortTourInformation?: ShortTourInformation;
}

// ─── Post ─────────────────────────────────────────────────────────────────────

export interface PostCard {
  databaseId: number;
  title: string;
  slug: string;
  uri: string | null;
  date: string;
  modified: string | null;
  excerpt: string | null;
  featuredImage: FeaturedImage | null;
  categories: { nodes: Category[] };
  destination: { nodes: Destination[] };
}

export interface PostDetail extends PostCard {
  seo?: SeoData;
  content: string; // Full HTML
  author: {
    node: {
      name: string;
      slug: string;
      avatar: { url: string } | null;
    };
  } | null;
  tags: { nodes: Array<{ name: string; slug: string }> };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export interface PageData {
  databaseId: number;
  title: string;
  slug: string;
  uri: string | null;
  content: string | null;
  date: string | null;
  modified: string | null;
  featuredImage: FeaturedImage | null;
  template: { templateName: string } | null;
  isFrontPage: boolean;
  seo?: SeoData;
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export interface MenuItem {
  databaseId: number;
  label: string;
  url: string;
  path: string;
  target: string | null;
  cssClasses: string[] | null;
  parentId: string | null;
  parentDatabaseId: number;
  order: number | null;
  connectedNode?: {
    node: {
      slug?: string;
      uri?: string;
    };
  } | null;
  childItems?: { nodes: MenuItem[] };
}

export interface Menu {
  databaseId: number;
  name: string;
  slug: string;
  locations: string[];
  menuItems: { nodes: MenuItem[] };
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export interface GeneralSettings {
  title: string;
  description: string;
  url: string;
  language: string;
}

// ─── Query Response Types ─────────────────────────────────────────────────────

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface GetAllToursResponse {
  products: { nodes: TourCard[]; pageInfo: PageInfo };
}

export interface GetTourBySlugResponse {
  product: TourDetail | null;
}

export interface GetAllDestinationsResponse {
  allDestination: { nodes: Destination[] };
}

export interface GetDestinationBySlugResponse {
  destination: Destination & {
    products: { nodes: TourCard[] };
    posts: { nodes: PostCard[] };
  };
}

export interface GetAllBlogPostsResponse {
  posts: { nodes: PostCard[]; pageInfo: PageInfo };
}

export interface GetPostBySlugResponse {
  post: PostDetail | null;
}

export interface GetAllPagesResponse {
  pages: { nodes: PageData[] };
}

export interface GetPageBySlugResponse {
  page: PageData | null;
}

export interface GetSiteSettingsResponse {
  generalSettings: GeneralSettings;
}

export interface GetLayoutDataResponse {
  generalSettings: GeneralSettings;
  menus: { nodes: Menu[] };
}

export interface GetAllMenusResponse {
  menus: { nodes: Menu[] };
}

export interface GetTourConstantResponse {
  tourConstantOptions: {
    tourConstant: TourConstant;
  };
}

export interface GetTourFilterOptionsResponse {
  allDestination: { nodes: Destination[] };
  allPaTourType: { nodes: TourType[] };
  allPaTravelStyle: { nodes: TravelStyle[] };
  productTags: { nodes: ProductTag[] };
}
