/* eslint-disable @arthurgeron/react-usememo/require-usememo */
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import { createTableOfContents } from "@/components/table-of-content/create-table-of-content";
import { getBreadcrumbFromSEO } from "@/lib/utils";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import { Product } from "@/services/infrastructure/wordpress/types/product";
import { SideBarItem } from "@/services/infrastructure/wordpress/types/sideBar";
import DetailPostSection from "@/views/post/detail-post-section";
import ProductRelatedSection from "@/views/product/product-detail/product-related-section";
import SideBarAccordionSection from "../sidebar-accordion-section";
import PostPriceSection from "../post-price-section";
import SocialSharing from "@/components/social-sharing/social-sharing";
import PostHeaderSection from "../post-header-section";
import dynamic from "next/dynamic";

type Props = {
  // latestPosts: Post[];
  post: Post;
  relatedProduct: Product[];
  sideBar: SideBarItem | null;
};

const CommentsSection = dynamic(() => import("@/views/post/comments-section"));
const TableOfContentActiveHeading = dynamic(
  () => import("@/components/table-of-content/TableOfContentActiveHeading"),
  { ssr: false }
);
function PostDetailView({ post, relatedProduct, sideBar }: Props) {
  const hasNumberingPrefix = post.content?.includes("<h2>1.") ?? false;

  const { content, toc } = createTableOfContents(post.content, {
    numberingPrefix: !hasNumberingPrefix,
  });
  // Overwrite post content with new content from createTableOfContents
  post.content = content;

  const tocStyle = {
    className: "flex w-full flex-col gap-3 rounded-lg bg-white px-4 py-2",
    contentClassName: "scrollbar-none overflow-y-auto ",
  };

  return (
    <>
      <div className="lg:px-auto m-auto flex h-auto w-full max-w-screen-xl flex-col items-center justify-center gap-4 px-5 pb-4 md:px-10">
        <div className="mt-3 flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
          <Breadcrumbs
            links={getBreadcrumbFromSEO(post)}
            hasBackground={false}
            rootClassName="m-0 pl-0 w-full"
            hiddenLastLink
          />
          <SocialSharing
            post={post}
            className="h-5 flex-none self-end md:self-center"
          />
        </div>
        <PostHeaderSection post={post} />
      </div>
      <div className="lg:px-auto m-auto flex h-auto w-full max-w-screen-xl flex-col items-center justify-center gap-4 pb-4 lg:px-10">
        <div className="z-30 flex w-full flex-col flex-nowrap justify-between gap-6 sm:flex-col md:flex-col lg:flex-row">
          <div className="flex w-full flex-col gap-6 lg:w-8/12">
            <DetailPostSection post={post} />
            <CommentsSection
              comments={post?.comments?.nodes ?? []}
              postId={post?.postId ?? -1}
              type="post"
            />
          </div>
          <div className="z-30 flex w-full flex-col gap-4 lg:w-4/12">
            <div className="sticky top-16 flex flex-col gap-4">
              <PostPriceSection post={post} />
              {sideBar && (
                <SideBarAccordionSection sideBarItem={sideBar} product={post} />
              )}
              <TableOfContentActiveHeading
                toc={toc}
                depth={5}
                style={tocStyle}
              />
            </div>
          </div>
        </div>
        {relatedProduct.length !== 0 && (
          <ProductRelatedSection products={relatedProduct} />
        )}
      </div>
    </>
  );
}

export default PostDetailView;
