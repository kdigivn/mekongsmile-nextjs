/* eslint-disable @arthurgeron/react-usememo/require-memo */
/* eslint-disable @arthurgeron/react-usememo/require-usememo */
import { Category } from "@/services/infrastructure/wordpress/types/category";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import { format } from "date-fns";
import Image from "next/image";
import BlogCategoryView from "./blog-category-view";
import HeadingBase from "@/components/heading/heading-base";
import LinkBase from "@/components/link-base";
import BlogCustomChip from "./blog-custom-chip";
import { CiCalendar } from "react-icons/ci";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import { Button } from "@/components/ui/button";
import { MdArrowForward } from "react-icons/md";
import { cn, removeSquareBracketsInExcerpt } from "@/lib/utils";

// Tiny SVG blur placeholder for blog featured images
const BLOG_BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI5Ij48cmVjdCBmaWxsPSIjMWEzNjVkIiB3aWR0aD0iMTYiIGhlaWdodD0iOSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+";

type Props = {
  posts: Post[];
  highLightPosts: Post[];
  categories: Category[];
  slug?: string;
};

const BlogView = ({ posts, highLightPosts, categories, slug }: Props) => {
  highLightPosts = highLightPosts.filter((post) => post.postId);

  const firstThreeCategoryHasPosts = categories
    .filter((category) =>
      posts.some((post) => post.categories?.nodes[0].name === category.name)
    )
    .slice(0, 3);

  const othersCategories = categories?.filter(
    (category) =>
      !firstThreeCategoryHasPosts.some(
        (firstThreeCategory) => firstThreeCategory.name === category.name
      )
  );

  const links = [
    { name: "Trang chủ", href: "/" },
    { name: "Blog", href: `/${slug}` },
  ];

  return (
    <div className="flex flex-col gap-4 pb-12">
      <div className="flex flex-col gap-4">
        <div className="relative h-auto w-full lg:p-8 lg:pt-0">
          {/* Optimized Background Image */}
          <div className="z-1 absolute inset-0">
            <Image
              src="/static-img/blog-background.jpg"
              alt="Background"
              fill
              className="object-cover object-top"
              quality={75}
            />
          </div>
          <div className="z-[2] m-auto mx-5 flex max-w-7xl flex-col gap-6 md:mx-10 md:px-3 lg:mx-auto">
            {/* Breadcrumbs */}
            <Breadcrumbs links={links} hasBackground={false} />
          </div>
          <div className="z-[2] m-auto mx-5 flex max-w-7xl flex-col gap-3 md:mx-10 md:gap-6 md:px-3 lg:mx-auto">
            {/* Header  */}
            <div className="flex flex-row p-2 px-2">
              <HeadingBase headingTag="h1">Blog</HeadingBase>
            </div>

            {/* Blog posts */}
            {highLightPosts && highLightPosts.length > 0 && (
              <div className="z-[3] grid grid-cols-2 grid-rows-4 gap-4 rounded-lg">
                <div className="col-span-2 row-span-4 flex flex-col gap-4 rounded-lg border-1 border-white bg-background p-4 hover:shadow-[0_8px_32px_rgba(128,128,128,0.1)] lg:col-span-1">
                  <LinkBase
                    href={`/${highLightPosts[0].slug}`}
                    className="group block h-full w-full overflow-hidden rounded-lg"
                  >
                    <Image
                      src={
                        highLightPosts[0].featuredImage?.node.sourceUrl
                          ? highLightPosts[0].featuredImage.node.sourceUrl
                          : "/static-img/placeholder-image-700x394.png"
                      }
                      alt={highLightPosts[0].title}
                      width={800}
                      height={400}
                      className="aspect-square transform rounded-lg object-cover transition-all duration-200 ease-in-out group-hover:rotate-1 group-hover:scale-105 md:aspect-video"
                      loading="eager"
                      priority
                      unoptimized
                      placeholder="blur"
                      blurDataURL={BLOG_BLUR_PLACEHOLDER}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 800px"
                    />
                  </LinkBase>
                  <div className="flex flex-col gap-2">
                    {highLightPosts[0].categories && (
                      <LinkBase
                        href={`${highLightPosts[0].categories?.nodes[0].uri}`}
                        className="block"
                      >
                        <BlogCustomChip
                          label={highLightPosts[0].categories?.nodes[0].name}
                        />
                      </LinkBase>
                    )}
                    <div className="line-clamp-2 text-ellipsis break-words text-sm font-bold text-black transition-all duration-200 ease-in-out hover:text-primary md:line-clamp-1 md:text-xl">
                      <LinkBase href={`/${highLightPosts[0].slug}`}>
                        {highLightPosts[0].title}
                      </LinkBase>
                    </div>
                    <div
                      className="line-clamp-4 min-h-20 text-sm font-normal text-default-600"
                      dangerouslySetInnerHTML={{
                        __html: removeSquareBracketsInExcerpt(
                          highLightPosts[0].excerpt ?? ""
                        ),
                      }}
                    />
                    <div className="flex h-5 flex-row items-center gap-1 text-sm">
                      <CiCalendar className="h-5 w-5" />
                      <div>
                        {format(new Date(highLightPosts[0].date), "dd/MM/yyyy")}
                      </div>
                    </div>
                  </div>
                </div>
                {highLightPosts.slice(1, 5).map((post: Post, index) => (
                  <div
                    key={index}
                    className={cn(
                      `col-span-2 flex flex-col gap-4 rounded-lg border-1 border-white bg-background p-4 hover:shadow-[0_8px_32px_rgba(128,128,128,0.1)] lg:col-span-1`,
                      index !== 0 && "border-0 border-t-2"
                    )}
                  >
                    <div className="flex flex-col gap-2">
                      {post.categories && (
                        <LinkBase
                          href={`${post.categories?.nodes[0].uri}`}
                          className="block"
                        >
                          <BlogCustomChip
                            label={post.categories?.nodes[0].name}
                          />
                        </LinkBase>
                      )}
                      <div className="line-clamp-2 text-ellipsis break-words text-sm font-bold text-black transition-all duration-200 ease-in-out hover:text-primary md:text-base">
                        <LinkBase href={`/${post.slug}`}>{post.title}</LinkBase>
                      </div>
                      <div className="flex h-5 flex-row items-center gap-1 text-sm">
                        <CiCalendar className="h-5 w-5" />
                        <div>{format(new Date(post.date), "dd/MM/yyyy")}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="lg:px-8">
          <div className="m-auto mx-5 flex max-w-7xl flex-col gap-6 md:mx-10 lg:mx-auto">
            {/* Categories */}
            {firstThreeCategoryHasPosts.map((category, index) => (
              <BlogCategoryView
                category={category}
                posts={posts.filter(
                  (post) => post.categories?.nodes[0].name === category.name
                )}
                key={index}
              />
            ))}

            {/* Other categories */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-start md:flex-row">
                <HeadingBase headingTag="h2">
                  Các chuyên mục nổi bật khác
                </HeadingBase>
              </div>
              <div className="flex flex-row flex-wrap gap-4">
                {othersCategories.map((category, index) => (
                  <OtherCategory category={category} key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OtherCategory = ({ category }: { category: Category }) => {
  return (
    <div className="flex flex-col gap-4">
      <LinkBase href={category.uri}>
        <Button
          variant={"link"}
          className="inline-flex gap-2 bg-white text-sm font-normal text-black transition-all duration-200 ease-in-out hover:text-primary hover:no-underline"
        >
          <span>{category.name}</span>
          <MdArrowForward className="h-4 w-4" />
        </Button>
      </LinkBase>
    </div>
  );
};

export default BlogView;
