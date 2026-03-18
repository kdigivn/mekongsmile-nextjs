/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { Post } from "@/services/infrastructure/wordpress/types/post";
import { Category } from "@/services/infrastructure/wordpress/types/category";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import PostCard from "@/components/cards/post-cards";
import { Tag } from "@/services/infrastructure/wordpress/types/tag";
import { Product } from "@/services/infrastructure/wordpress/types/product";
import BlogPaginator from "../post/blog-paginator";
import { Term } from "@/services/infrastructure/wordpress/types/term";
import {
  cn,
  fixFormatDescription,
  getBreadcrumbFromSEO,
  wpURLtoNextURL,
} from "@/lib/utils";
import LinkBase from "@/components/link-base";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import React from "react";
import Image from "next/image";
import { getNotFoundImage } from "@/services/infrastructure/wordpress/queries/getBlockCustom";

type Props = {
  posts: Post[] | Product[] | (Post | Product)[];
  totalPage?: number;
  currentPage?: number;
  categoriesData?: Category[];
  tag?: Tag;
  title?: string;
  description?: string;
  termNode?: Term;
};

const ListView = async ({
  posts,
  totalPage,
  currentPage,
  tag,
  title,
  description,
  termNode,
  categoriesData,
}: Props) => {
  const pageInfo = {
    title: "Bài viết",
    header: (
      <h2 className="text-3xl font-bold text-black">
        Cẩm nang du lịch từ Nụ Cười Mê Kông
      </h2>
    ),
    subTitle:
      "Các bài viết trong chuyên mục blog cho quý khách những chia sẻ kinh nghiệm, trải nghiệm du lịch các địa điểm du lịch nổi tiếng tại Việt Nam",
    navigate: "/posts",
  };

  if (tag) {
    pageInfo.title = "Nhãn";
    pageInfo.header = (
      <div className="flex -translate-y-1 items-center gap-1 text-3xl font-bold text-black">
        <h2>Nhãn</h2>
        <p className="max-w-40 truncate rounded-md border border-primary bg-primary-100 p-1 text-xl text-primary-800">
          {tag.name}
        </p>
      </div>
    );
    pageInfo.subTitle = "Những bài post chuyên sâu hơn về một vấn đề";
    pageInfo.navigate = `/tag`;
  }

  if (title) {
    pageInfo.title = title;
    pageInfo.header = (
      <h2 className="text-xl font-bold text-black md:text-2xl md:font-semibold">
        {title}
      </h2>
    );
    pageInfo.subTitle =
      "Các bài viết trong chuyên mục blog cho quý khách những chia sẻ kinh nghiệm, trải nghiệm du lịch các địa điểm du lịch nổi tiếng tại Việt Nam";
  }

  if (description) {
    pageInfo.subTitle = description;
  }

  const links = getBreadcrumbFromSEO(termNode!) ?? [];
  let notFoundImage = await getNotFoundImage();
  if (notFoundImage === "") {
    notFoundImage = "/static-img/empty-search.svg";
  }

  return (
    <>
      {/* Add Json+Ld here */}
      <div
        dangerouslySetInnerHTML={{
          __html: wpURLtoNextURL(termNode?.seo.jsonLd.raw ?? ""),
        }}
      />
      <div className="m-auto mx-5 flex max-w-7xl flex-col gap-6 px-3 md:mx-10 lg:mx-auto">
        <Breadcrumbs links={links} hasBackground={false} />
      </div>
      <div className="m-auto mx-5 flex max-w-7xl flex-col gap-6 px-3 md:mx-10 lg:mx-auto">
        <div className="flex flex-col items-start justify-center gap-3 rounded-lg px-2 pb-3 md:gap-4 lg:gap-5">
          <div className="relative text-center">
            <div className="absolute left-0 top-3 z-20 h-4 w-4 rounded bg-primary-100 backdrop-blur-md sm:left-[-8px] sm:right-0 md:h-5 md:w-5 lg:left-[-12px] lg:h-6 lg:w-6"></div>
            <div className="relative z-20 flex w-full gap-2">
              {/* <span className="block text-primary"></span> */}

              {pageInfo.header}

              {/* <span className="block">Cẩm nang du lịch từ Nụ Cười Mê Kông</span> */}
            </div>
          </div>

          <div
            className={cn(!description && "hidden", "post-detail")}
            dangerouslySetInnerHTML={{
              __html: fixFormatDescription(description ?? ""),
            }}
          />
        </div>

        <div className="flex">
          {/* <div className="hidden lg:block lg:w-4/12">Filter</div> */}
          <div className="w-full">
            {posts.length === 0 ? (
              <div className="mb-4 flex h-fit flex-col items-center justify-center gap-4 rounded-lg bg-white py-6">
                <Image
                  src={notFoundImage}
                  alt="Empty blog"
                  height={150}
                  width={150}
                  loading="lazy"
                  className="h-60 w-60 !rounded-none object-cover"
                  unoptimized
                />
                <h2 className="text-center text-2xl font-semibold">
                  Chuyên mục hiện <span className="text-primary">chưa có</span>{" "}
                  bài viết
                </h2>
                <p className="text-sm font-normal">
                  Bạn vui lòng xem chuyên mục khác nhé!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {categoriesData && categoriesData.length > 0 ? (
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="mb-2 flex gap-2">
                      <LinkBase href={`/${categoriesData[0].slug}`}>
                        <button
                          className={cn(
                            "rounded-lg bg-white px-4 py-2 text-sm font-normal",
                            termNode?.slug === categoriesData[0].slug
                              ? "cursor-default border border-primary bg-primary-100 text-primary"
                              : "text-black hover:bg-primary hover:text-white"
                          )}
                          disabled={termNode?.slug === categoriesData[0].slug}
                        >
                          Tất cả
                        </button>
                      </LinkBase>

                      {categoriesData[0].children.nodes.length > 0 && (
                        <>
                          {/* Container with flex for layout */}
                          {categoriesData[0].children.nodes?.map((child) => (
                            <LinkBase
                              key={child.categoryId}
                              href={`/${categoriesData[0].slug}/${child.slug}`}
                              className="inline-block"
                            >
                              <button
                                className={cn(
                                  "rounded-lg bg-white px-4 py-2 text-sm font-normal",
                                  termNode?.slug === child.slug
                                    ? "cursor-default border border-primary bg-primary-100 text-primary"
                                    : "text-black hover:bg-primary hover:text-white"
                                )}
                                disabled={termNode?.slug === child.slug}
                              >
                                {child.name}
                              </button>
                            </LinkBase>
                          ))}
                        </>
                      )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                ) : null}
                <div
                  className={cn(
                    "grid grid-cols-12 gap-4",
                    totalPage === 1 && "mb-10"
                  )}
                >
                  {posts.map((post, idx) => (
                    <PostCard key={idx} post={post} priority={idx === 0} />
                  ))}
                </div>
                <BlogPaginator
                  pageNumber={(currentPage ?? 1).toString()}
                  totalPage={totalPage ?? 1}
                  pagination={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ListView;
