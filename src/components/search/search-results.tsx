/* eslint-disable @arthurgeron/react-usememo/require-usememo */
"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  SearchContentType,
  SearchDocument,
} from "@/services/infrastructure/meilisearch/meilisearch.type";
import { BsFileEarmarkPost } from "react-icons/bs";
import { TbBrandPagekit } from "react-icons/tb";
import { FaTag } from "react-icons/fa6";
import Image from "next/image";
import LinkBase from "../link-base";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import { Button } from "../ui/button";
import BlogCustomChip from "@/views/blog/blog-custom-chip";
import { CiCalendar } from "react-icons/ci";
import { format } from "date-fns";
import { RiPagesLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSearchDialogActions } from "./context/use-search-dialog-actions";
import Highlight from "./highlight";

type Props = {
  highLightPosts: Post[];
  searchResults: SearchDocument[];
  setFilter: (filter: string) => void;
  query: string;
};

const SearchResults = ({
  highLightPosts,
  searchResults,
  setFilter,
  query,
}: Props) => {
  const { toggleOpen } = useSearchDialogActions();
  const [activeIndex, setActiveIndex] = useState<number>(0); // Track the active item
  const [currentTab, setCurrentTab] = useState<SearchContentType | null>(null);

  const router = useRouter();

  const postItems = searchResults.filter(
    (item) => item.type === SearchContentType.POST
  );

  const productItems = searchResults.filter(
    (item) => item.type === SearchContentType.PRODUCT
  );

  const pageItems = searchResults.filter(
    (item) => item.type === SearchContentType.PAGE
  );

  const termItems = searchResults.filter(
    (item) => item.type === SearchContentType.TERM
  );

  const tagItems = searchResults.filter(
    (item) => item.type === SearchContentType.TAG
  );

  const newItems = useMemo(() => {
    return [
      ...postItems,
      ...productItems,
      ...pageItems,
      ...termItems,
      ...tagItems,
    ];
  }, [pageItems, postItems, productItems, tagItems, termItems]);
  console.log("newItems", newItems);

  useEffect(() => {
    if (currentTab) {
      setFilter(`type = '${currentTab}'`);
    }
  }, [currentTab, setFilter]);

  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "w" || event.key === "ArrowUp") {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (event.key === "s" || event.key === "ArrowDown") {
        setActiveIndex((prev) =>
          prev < newItems.length - 1 ? prev + 1 : prev
        );
      } else if (event.key === "Enter") {
        toggleOpen(); // Close the dialog
        router.push(newItems[activeIndex].url);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Scroll the active item into view when it changes
    const currentItem = itemRefs.current[activeIndex];
    if (currentItem) {
      currentItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, newItems, router, toggleOpen]);

  const configs: {
    [key: string]: {
      title: string;
      color:
        | "primary"
        | "grey"
        | "success"
        | "info"
        | "warning"
        | "danger"
        | "error"
        | undefined;
      icon: JSX.Element;
      type?: SearchContentType;
    };
  } = {
    [SearchContentType.POST]: {
      title: "Bài viết",
      color: "primary",
      icon: <BsFileEarmarkPost />,
      type: SearchContentType.POST,
    },
    [SearchContentType.PAGE]: {
      title: "Trang",
      color: "danger",
      icon: <TbBrandPagekit />,
      type: SearchContentType.PAGE,
    },
    [SearchContentType.PRODUCT]: {
      title: "Dịch vụ",
      color: "warning",
      icon: <FaTag />,
      type: SearchContentType.PRODUCT,
    },
    [SearchContentType.TERM]: {
      title: "Từ khoá",
      color: "primary",
      icon: <FaTag />,
      type: SearchContentType.TERM,
    },
    [SearchContentType.TAG]: {
      title: "Tag",
      color: "primary",
      icon: <FaTag />,
      type: SearchContentType.TAG,
    },
    ["all"]: {
      title: "Tất cả kết quả  ",
      color: "danger",
      icon: <FaTag />,
    },
  };

  const searchContentTypeList = Object.values(SearchContentType);

  const highLightTitleClassName = {
    root: "text-base font-semibold line-clamp-1",
    highlighted: "text-primary !bg-transparent",
  };

  const highLightTagClassName = {
    root: "text-base font-semibold line-clamp-1",
    highlighted: "text-primary underline !bg-transparent",
  };

  const highLightContentClassName = {
    root: "text-sm line-clamp-2",
    highlighted: "text-primary !bg-transparent",
  };

  const handleTabClick = (item: string) => {
    setCurrentTab(item === "all" ? null : (item as SearchContentType));
  };

  const renderFeaturedPosts = () => {
    return (
      <div className="flex flex-col gap-3">
        <BlogCustomChip label="Tìm kiếm nổi bật" />
        <div className="grid grid-cols-2 gap-3">
          {highLightPosts.slice(0, 4).map((post, idx) => {
            return (
              <div
                key={idx}
                className={`col-span-2 grid grid-cols-2 gap-4 rounded-lg border-1 border-white bg-background p-4 hover:bg-default-100 lg:col-span-1`}
              >
                <LinkBase href={`${post.uri}`} className="col-span-1 block">
                  <Image
                    src={
                      post.featuredImage?.node.sourceUrl ??
                      "/static-img/placeholder-image-700x394.png"
                    }
                    alt={post.title}
                    width={700}
                    height={394}
                    className="aspect-video rounded-lg object-cover"
                    unoptimized
                  />
                </LinkBase>
                <div className="col-span-1 flex flex-col justify-between">
                  <LinkBase
                    className="line-clamp-3 h-[60px] text-ellipsis break-words text-sm font-bold text-black transition-all duration-200 ease-in-out hover:text-primary"
                    href={`${post.uri}`}
                  >
                    {post.title}
                  </LinkBase>
                  <div className="flex h-5 flex-row items-center gap-1 text-sm">
                    <CiCalendar className="h-5 w-5" />
                    <div>{format(new Date(post.date), "dd/MM/yyyy")}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-row flex-wrap gap-2">
          {["all", ...searchContentTypeList].map((item, idx) => {
            return (
              <Button
                key={idx}
                // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                onClick={() => handleTabClick(item)}
                className={`rounded-lg border-0 px-4 py-2 shadow-none transition-all duration-200 ease-in-out ${
                  currentTab === item || (currentTab === null && idx === 0)
                    ? "bg-primary text-white"
                    : "bg-default-100 text-default-700 hover:bg-default-200"
                }`}
              >
                {configs[item].title}
              </Button>
            );
          })}
        </div>
        {query === "" &&
          highLightPosts &&
          highLightPosts.length > 0 &&
          renderFeaturedPosts()}
        {newItems.length === 0 && query !== "" && (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <Image
              src="/static-img/empty-search.svg"
              alt="Empty blog"
              height={150}
              width={150}
              loading="lazy"
              className="h-60 w-60 !rounded-none object-cover"
            />
            <p className="text-base font-semibold lg:text-2xl">
              Không tìm thấy kết quả
            </p>
          </div>
        )}
        {query !== "" && newItems.length > 0 && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="text-base font-semibold">Kết quả tìm kiếm</div>
            {postItems.length > 0 &&
              (currentTab === null ||
                currentTab === SearchContentType.POST) && (
                <div className="flex flex-col gap-4">
                  <BlogCustomChip
                    label="Bài viết"
                    color={configs["POST"].color}
                  />
                  {postItems.map((hit) => {
                    const index = newItems.findIndex(
                      (item) => item.url === hit.url
                    );
                    return (
                      <LinkBase
                        ref={(el) => void (itemRefs.current[index] = el)} // Assign ref to each item
                        key={hit.url}
                        className={cn(
                          `line-clamp-2 grid grid-cols-12 gap-3 rounded-lg p-4 transition-all ease-in-out hover:rounded-lg hover:bg-default-100`,
                          activeIndex === index &&
                            "rounded-lg bg-default-100 p-2"
                        )} // Highlight active item
                        href={hit.url}
                      >
                        <Image
                          src={
                            hit.thumbnailUrl ??
                            "/static-img/placeholder-image-700x394.png"
                          }
                          alt={hit.title}
                          width={128}
                          height={128}
                          className="col-span-3 aspect-video w-full rounded-lg object-cover"
                          unoptimized
                        />
                        <div className="col-span-9 flex flex-col justify-between gap-2">
                          <Highlight
                            searchTerm={query}
                            text={hit.title}
                            className={highLightTitleClassName.root}
                            highlightClassName={
                              highLightTitleClassName.highlighted
                            }
                          />

                          <Highlight
                            searchTerm={query}
                            text={hit.content ?? ""}
                            className={highLightContentClassName.root}
                            highlightClassName={
                              highLightContentClassName.highlighted
                            }
                          />
                          <div className="flex h-5 flex-row items-center gap-1 text-sm">
                            <CiCalendar className="h-5 w-5" />
                            <div>
                              {format(
                                hit.createdAt
                                  ? new Date(hit.createdAt)
                                  : new Date(),
                                "dd/MM/yyyy"
                              )}
                            </div>
                          </div>
                        </div>
                      </LinkBase>
                    );
                  })}
                </div>
              )}
            {productItems.length > 0 &&
              (currentTab === null ||
                currentTab === SearchContentType.PRODUCT) && (
                <div className="flex flex-col gap-4">
                  <BlogCustomChip
                    label="Sản phẩm"
                    color={configs["PRODUCT"].color}
                  />
                  {productItems.map((hit) => {
                    const index = newItems.findIndex(
                      (item) => item.url === hit.url
                    );
                    return (
                      <LinkBase
                        ref={(el) => void (itemRefs.current[index] = el)} // Assign ref to each item
                        key={hit.url}
                        className={cn(
                          `line-clamp-2 grid grid-cols-12 gap-3 rounded-lg p-4 transition-all ease-in-out hover:rounded-lg hover:bg-default-100`,
                          activeIndex === index &&
                            "rounded-lg bg-default-100 p-2"
                        )} // Highlight active item
                        href={hit.url}
                      >
                        <Image
                          src={
                            hit.thumbnailUrl ??
                            "/static-img/placeholder-image-700x394.png"
                          }
                          alt={hit.title}
                          width={128}
                          height={128}
                          className="col-span-3 aspect-video w-full rounded-lg object-cover"
                          unoptimized
                        />
                        <div className="col-span-9 flex flex-col justify-between gap-2">
                          {/* <Highlight
                            attribute="title"
                            hit={hit}
                            classNames={highLightTitleClassName}
                          />
                          <Highlight
                            attribute="content"
                            hit={hit}
                            classNames={highLightContentClassName}
                          /> */}
                          <Highlight
                            searchTerm={query}
                            text={hit.title}
                            className={highLightTitleClassName.root}
                            highlightClassName={
                              highLightTitleClassName.highlighted
                            }
                          />
                          <Highlight
                            searchTerm={query}
                            text={hit.content ?? ""}
                            className={highLightContentClassName.root}
                            highlightClassName={
                              highLightContentClassName.highlighted
                            }
                          />

                          <div className="flex h-5 flex-row items-center gap-1 text-sm">
                            <CiCalendar className="h-5 w-5" />
                            <div>
                              {format(
                                hit.createdAt
                                  ? new Date(hit.createdAt)
                                  : new Date(),
                                "dd/MM/yyyy"
                              )}
                            </div>
                          </div>
                        </div>
                      </LinkBase>
                    );
                  })}
                </div>
              )}
            {pageItems.length > 0 &&
              (currentTab === null ||
                currentTab === SearchContentType.PAGE) && (
                <div className="flex flex-col gap-4">
                  <BlogCustomChip label="Trang" color={configs["PAGE"].color} />
                  {pageItems.map((hit) => {
                    const index = newItems.findIndex(
                      (item) => item.url === hit.url
                    );
                    return (
                      <LinkBase
                        ref={(el) => void (itemRefs.current[index] = el)} // Assign ref to each item
                        key={hit.url}
                        className={cn(
                          `line-clamp-2 flex flex-row items-center gap-3 rounded-lg p-4 px-4 py-2 transition-all ease-in-out hover:rounded-lg hover:bg-default-100`,
                          activeIndex === index &&
                            "rounded-lg bg-default-100 p-2"
                        )} // Highlight active item
                        href={hit.url}
                      >
                        <div className="flex h-14 w-14 flex-none items-center justify-center rounded-lg bg-default-200">
                          <RiPagesLine className="h-7 w-7 text-default" />
                        </div>
                        <div className="flex flex-col justify-between gap-2">
                          {/* <Highlight
                            attribute="title"
                            hit={hit}
                            classNames={highLightTitleClassName}
                          />
                          <Highlight
                            attribute="content"
                            hit={hit}
                            classNames={highLightContentClassName}
                          /> */}
                          <Highlight
                            searchTerm={query}
                            text={hit.title}
                            className={highLightTitleClassName.root}
                            highlightClassName={
                              highLightTitleClassName.highlighted
                            }
                          />
                          <Highlight
                            searchTerm={query}
                            text={hit.content ?? ""}
                            className={highLightContentClassName.root}
                            highlightClassName={
                              highLightContentClassName.highlighted
                            }
                          />
                        </div>
                      </LinkBase>
                    );
                  })}
                </div>
              )}

            {termItems.length > 0 &&
              (currentTab === null ||
                currentTab === SearchContentType.TERM) && (
                <div className="flex flex-col gap-4">
                  <BlogCustomChip
                    label={configs["TERM"].title}
                    color={configs["TERM"].color}
                  />
                  <div className="flex flex-row flex-wrap gap-4">
                    {termItems.map((hit) => {
                      const index = newItems.findIndex(
                        (item) => item.url === hit.url
                      );
                      return (
                        <LinkBase
                          ref={(el) => void (itemRefs.current[index] = el)} // Assign ref to each item
                          key={hit.url}
                          className={cn(
                            `line-clamp-1 flex flex-row items-center gap-3 rounded-lg p-4 px-4 py-2 transition-all ease-in-out hover:rounded-lg hover:bg-default-100`,
                            activeIndex === index &&
                              "rounded-lg bg-default-100 p-2"
                          )} // Highlight active item
                          href={hit.url}
                        >
                          <FaTag className="h-5 w-5 text-primary" />
                          <BlogCustomChip
                            label={
                              // <Highlight
                              //   attribute="title"
                              //   hit={hit}
                              //   classNames={highLightTagClassName}
                              // />
                              <Highlight
                                searchTerm={query}
                                text={hit.title}
                                className={highLightTagClassName.root}
                                highlightClassName={
                                  highLightTagClassName.highlighted
                                }
                              />
                            }
                            color="primary"
                          />
                        </LinkBase>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>
        )}

        {tagItems.length > 0 &&
          (currentTab === null || currentTab === SearchContentType.TAG) && (
            <div className="flex flex-col gap-4">
              <BlogCustomChip
                label={configs["TAG"].title}
                color={configs["TAG"].color}
              />
              <div className="flex flex-row flex-wrap gap-4">
                {tagItems.map((hit) => {
                  const index = newItems.findIndex(
                    (item) => item.url === hit.url
                  );
                  return (
                    <LinkBase
                      ref={(el) => void (itemRefs.current[index] = el)} // Assign ref to each item
                      key={hit.url}
                      className={cn(
                        `line-clamp-1 flex flex-row items-center gap-3 rounded-lg p-4 px-4 py-2 transition-all ease-in-out hover:rounded-lg hover:bg-default-100`,
                        activeIndex === index && "rounded-lg bg-default-100 p-2"
                      )} // Highlight active item
                      href={hit.url}
                    >
                      <FaTag className="h-5 w-5 text-primary" />
                      <BlogCustomChip
                        label={
                          // <Highlight
                          //   attribute="title"
                          //   hit={hit}
                          //   classNames={highLightTagClassName}
                          // />
                          <Highlight
                            searchTerm={query}
                            text={hit.title}
                            className={highLightTagClassName.root}
                            highlightClassName={
                              highLightTagClassName.highlighted
                            }
                          />
                        }
                        color="primary"
                      />
                    </LinkBase>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </>
  );
};

export default memo(SearchResults);
