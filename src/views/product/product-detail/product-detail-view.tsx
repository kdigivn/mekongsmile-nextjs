/* eslint-disable @arthurgeron/react-usememo/require-usememo */
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import CommentsSection from "@/views/post/comments-section";
import React from "react";
import { Product } from "@/services/infrastructure/wordpress/types/product";
import DetailProductSection from "../detail-product-section";
import ProductSlideSection from "../product-slide-section";
import { getBreadcrumbFromSEO } from "@/lib/utils";
import { SideBarItem } from "@/services/infrastructure/wordpress/types/sideBar";
import ProductHeaderSection from "../product-header-section";
import BoxContentWrapper from "@/components/wrapper/BoxContentWrapper";
import ProductPriceSection from "../product-price-section";
import ProductRelatedSection from "./product-related-section";
import SideBarAccordionSection from "@/views/post/sidebar-accordion-section";
import SocialSharing from "@/components/social-sharing/social-sharing";
import Faq from "@/components/accordion/faq";
import { createTableOfContents } from "@/components/table-of-content/create-table-of-content";
import TableOfContentActiveHeading from "@/components/table-of-content/TableOfContentActiveHeading";
import { getServerTranslation } from "@/services/i18n";

type Props = {
  product: Product;
  sideBar: SideBarItem | null;
  relatedProduct: Product[];
};

async function ProductDetailView({ product, sideBar, relatedProduct }: Props) {
  const { t } = await getServerTranslation("vi", "toc-section");
  const links = getBreadcrumbFromSEO(product!) ?? [];
  const { content, toc } = createTableOfContents(product?.content ?? "", {
    numberingPrefix: true,
  });
  product.content = content;

  return (
    <>
      <div className="lg:px-auto m-auto flex h-auto w-full max-w-screen-xl flex-col items-center justify-center gap-4 px-5 pb-4 md:px-10">
        <div className="flex w-full flex-col items-end gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-1 items-center gap-2">
            <Breadcrumbs links={links} hasBackground={false} />
          </div>
          <SocialSharing post={product} />
        </div>

        <BoxContentWrapper className="flex-col border-none bg-transparent p-0">
          <ProductHeaderSection product={product} />
          <ProductSlideSection product={product} />
        </BoxContentWrapper>

        <div className="z-30 flex w-full flex-col flex-nowrap justify-between gap-4 sm:flex-col md:flex-col lg:flex-row">
          <div className="flex w-full flex-col gap-4 lg:w-8/12">
            <DetailProductSection product={product} />
            <CommentsSection
              comments={product?.comments?.nodes ?? []}
              postId={product?.productId ?? -1}
              type="product"
            />
          </div>
          <div className="z-30 flex w-full flex-col gap-4 lg:w-4/12">
            <div className="sticky top-16 flex flex-col gap-4">
              <ProductPriceSection product={product} />
              {sideBar && (
                <SideBarAccordionSection
                  sideBarItem={sideBar}
                  product={product}
                />
              )}
              <TableOfContentActiveHeading
                toc={toc}
                depth={5}
                titleText={t("title")}
                style={{
                  className: "bg-white px-4 rounded-md",
                  contentClassName: "scrollbar-none overflow-y-auto ",
                }}
              />
            </div>
          </div>
        </div>
        <Faq />
        {relatedProduct.length !== 0 && (
          <ProductRelatedSection products={relatedProduct} />
        )}
      </div>
    </>
  );
}

export default ProductDetailView;
