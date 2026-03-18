/* eslint-disable @arthurgeron/react-usememo/require-memo */
/* eslint-disable @arthurgeron/react-usememo/require-usememo */
import { Post } from "@/services/infrastructure/wordpress/types/post";
import { Hang } from "@/services/infrastructure/wordpress/types/hang";
import HeadingBase from "@/components/heading/heading-base";
import { getServerTranslation } from "@/services/i18n";
import BoxContentWrapper from "@/components/wrapper/BoxContentWrapper";
import LayoutWrapper from "@/components/wrapper/layout-wrapper";
import { ImageLinkTypeItem } from "@/services/infrastructure/wordpress/types/sideBar";
import LinkBase from "@/components/link-base";
import { Button } from "@/components/ui/button";
import { MdArrowForward } from "react-icons/md";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Server components — keep static import
import CoopSection from "../coop-section";
import Faq from "@/components/accordion/faq";

// Client components — code-split but SSR'd for SEO (dynamic without ssr:false)
const CouponsSection = dynamic(() => import("../coupons-section"), {
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-gray-100" />,
});
const PostsSectionWithCarousel = dynamic(
  () => import("../posts-section-with-carousel"),
  {
    loading: () => (
      <div className="h-80 animate-pulse rounded-lg bg-gray-100" />
    ),
  }
);
const PostsSection = dynamic(() => import("../posts-section"), {
  loading: () => <div className="h-80 animate-pulse rounded-lg bg-gray-100" />,
});
const OperatorsSection = dynamic(() => import("../operators-section"), {
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-gray-100" />,
});

type Props = {
  isHiddenCoupons?: boolean;
  isHiddenPosts?: boolean;
  isHiddenCoop?: boolean;
  isHiddenFaq?: boolean;
  isHiddenTravelGuideSections?: boolean;
  isHiddenPostsOfOperators?: boolean;
  isHiddenProducts?: boolean;
  posts: Post[];
  products: Post[];
  advertisingPosts: Post[];
  travelGuidePosts: Post[];
  hangs: Hang[];
  operatorImgs: ImageLinkTypeItem[];
};

/**
 * Manages the layout and conditional rendering of various sections on a page,
 * such as Coupons, Blog Posts, Travel Guide, Cooperative Partners, Posts from Operators, and FAQs.
 *
 * @param {boolean} [isHiddenCoupons] - Controls visibility of the Coupons section (optional).
 * @param {boolean} [isHiddenPosts] - Controls visibility of the Blog Posts section (optional).
 * @param {boolean} [isHiddenCoop] - Controls visibility of the Cooperative Partners section (optional).
 * @param {boolean} [isHiddenFaq] - Controls visibility of the FAQ section (optional).
 * @param {boolean} [isHiddenTravelGuideSections] - Controls visibility of the Travel Guide section (optional).
 * @param {boolean} [isHiddenPostsOfOperators] - Controls visibility of the Posts of Operators section (optional).
 * @param {boolean} [isHiddenProducts] - Controls visibility of the Products section (optional).
 * @param {Post[]} posts - Array of blog posts for the PostsSection.
 * @param {Post[]} products - Array of products .
 * @param {Post[]} advertisingPosts - Array of advertisements for the CouponsSection.
 * @param {Post[]} travelGuidePosts - Array of travel guide posts for the Travel Guide section.
 * @param {Hang[]} hangs - Array of cooperative partners for the CoopSection.
 *
 * @returns {JSX.Element} - Renders a dynamic layout with various sections based on the provided props.
 *
 * @example
 * ```
 * <MainLayoutSection
 *   isHiddenCoop={false}
 *   isHiddenCoupons={true}
 *   isHiddenPosts={false}
 *   isHiddenFaq={true}
 *   isHiddenTravelGuideSections={false}
 *   isHiddenPostsOfOperators={true}
 *   posts={postsData}
 *   advertisingPosts={adsData}
 *   travelGuidePosts={travelGuideData}
 *   hangs={partnersData}
 *   faq={faqData}
 * />
 * ```
 */
const MainLayoutSection = async ({
  isHiddenCoop,
  isHiddenCoupons,
  isHiddenPosts,
  isHiddenFaq,
  isHiddenTravelGuideSections,
  isHiddenPostsOfOperators,
  isHiddenProducts,
  posts,
  products,
  advertisingPosts,
  travelGuidePosts,
  hangs,
  operatorImgs,
}: Props) => {
  const { t: blogSectionTranslate } = await getServerTranslation(
    "vi",
    "home/blog-section"
  );

  const { t: postsOfOperatorsTranslate } = await getServerTranslation(
    "vi",
    "home/posts-of-operators-section"
  );

  const { t: travelGuideSectionTranslate } = await getServerTranslation(
    "vi",
    "home/travel-guide-section"
  );

  return (
    <LayoutWrapper>
      {!isHiddenCoupons && advertisingPosts && advertisingPosts.length > 0 && (
        <CouponsSection advertisingPosts={advertisingPosts} />
      )}

      {!isHiddenProducts && (
        <>
          <BoxContentWrapper className="m-0 items-center justify-center border-none bg-transparent p-0">
            <HeadingBase>{blogSectionTranslate("title-product")}</HeadingBase>
          </BoxContentWrapper>

          <PostsSectionWithCarousel posts={products} />
        </>
      )}

      <BoxContentWrapper className="m-0 items-center justify-center border-none bg-transparent p-0">
        <HeadingBase>{postsOfOperatorsTranslate("title")}</HeadingBase>
      </BoxContentWrapper>

      {!isHiddenPostsOfOperators && <OperatorsSection hangs={hangs} />}

      <BoxContentWrapper className="m-0 items-center justify-center border-none bg-transparent p-0">
        <HeadingBase>{travelGuideSectionTranslate("title")}</HeadingBase>
      </BoxContentWrapper>

      {!isHiddenTravelGuideSections && (
        <PostsSectionWithCarousel posts={travelGuidePosts} />
      )}

      <BoxContentWrapper className="m-0 items-center justify-center border-none bg-transparent p-0">
        <HeadingBase>{blogSectionTranslate("title")}</HeadingBase>
      </BoxContentWrapper>

      {!isHiddenPosts && <PostsSection posts={posts} />}
      <LinkBase
        href={`/blog`}
        className="flex w-full flex-row justify-center lg:justify-end"
      >
        <Button
          variant={"link"}
          className="inline-flex gap-2 bg-primary-100 text-base text-primary transition-all duration-200 ease-in-out hover:bg-primary-200 hover:no-underline hover:shadow-md"
        >
          <span>Xem thêm</span>
          <MdArrowForward className="h-4 w-4" />
        </Button>
      </LinkBase>
      <Suspense
        fallback={<div className="h-40 animate-pulse rounded-lg bg-gray-100" />}
      >
        {!isHiddenCoop && <CoopSection operatorImgs={operatorImgs} />}
      </Suspense>

      <Suspense
        fallback={<div className="h-64 animate-pulse rounded-lg bg-gray-100" />}
      >
        {!isHiddenFaq && <Faq />}
      </Suspense>
    </LayoutWrapper>
  );
};

export default MainLayoutSection;
