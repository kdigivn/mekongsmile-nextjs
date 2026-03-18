/* eslint-disable @arthurgeron/react-usememo/require-memo */
import HeadingBase from "@/components/heading/heading-base";
import LinkBase from "@/components/link-base";
import { Button } from "@/components/ui/button";
import { Category } from "@/services/infrastructure/wordpress/types/category";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import { format } from "date-fns";
import Image from "next/image";
import BlogCustomChip from "./blog-custom-chip";
import { CiCalendar } from "react-icons/ci";
import { MdArrowForward } from "react-icons/md";
import { removeSquareBracketsInExcerpt } from "@/lib/utils";

type Props = {
  category: Category;
  posts: Post[];
};

const BlogCategoryView = ({ category, posts }: Props) => {
  return (
    posts.length > 0 && (
      <div className="flex flex-col gap-6">
        {/* Header  */}
        <div className="flex flex-row items-center justify-between p-3 md:flex-row">
          <HeadingBase headingTag="h2">{category.name}</HeadingBase>
          <LinkBase href={`${category.uri}`}>
            <Button
              variant={"link"}
              className="inline-flex gap-2 bg-primary-100 text-base text-primary transition-all duration-200 ease-in-out hover:bg-primary-200 hover:no-underline hover:shadow-md"
            >
              <span>Xem thêm</span>
              <MdArrowForward className="h-4 w-4" />
            </Button>
          </LinkBase>
        </div>

        {/* Blog posts */}
        <div className="grid grid-cols-12 gap-4 rounded-lg">
          {posts.slice(0, 6).map((post, index) => (
            <div
              key={index}
              className={`col-span-12 grid w-full grid-cols-12 gap-3 rounded-lg border-1 border-white bg-background p-4 lg:col-span-6`}
            >
              <LinkBase
                href={`${post.uri}`}
                className="group col-span-12 block h-full w-full overflow-hidden rounded-lg sm:col-span-4 lg:col-span-5"
              >
                <Image
                  src={
                    post.featuredImage?.node.sourceUrl
                      ? post.featuredImage.node.sourceUrl
                      : "/static-img/placeholder-image-700x394.png"
                  }
                  alt={post.title}
                  width={250}
                  height={200}
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 33vw, 20vw"
                  className="aspect-video w-full rounded-lg object-cover object-left transition-all duration-200 ease-in-out group-hover:rotate-1 group-hover:scale-105 sm:w-72 md:aspect-auto"
                  unoptimized
                />
              </LinkBase>

              <div className="col-span-12 flex flex-col justify-between gap-3 sm:col-span-8 lg:col-span-7">
                {post.categories && (
                  <LinkBase href={`${category.uri}`} className="block">
                    <BlogCustomChip label={post.categories.nodes[0].name} />
                  </LinkBase>
                )}
                <div className="flex w-full">
                  <LinkBase
                    href={`/${post.slug}`}
                    className="!line-clamp-2 block h-12 overflow-hidden text-ellipsis break-words text-base font-bold text-black transition-all duration-200 ease-in-out hover:text-primary"
                  >
                    {post.title}
                  </LinkBase>
                </div>
                <div
                  className="!line-clamp-4 hidden h-10 text-sm font-normal text-black md:block"
                  dangerouslySetInnerHTML={{
                    __html: removeSquareBracketsInExcerpt(post.excerpt ?? ""),
                  }}
                />
                <div className="flex h-5 flex-row items-center gap-1 text-sm">
                  <CiCalendar className="h-5 w-5" />
                  <div>{format(new Date(post.date), "dd/MM/yyyy")}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default BlogCategoryView;
