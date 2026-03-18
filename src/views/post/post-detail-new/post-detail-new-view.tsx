/* eslint-disable @arthurgeron/react-usememo/require-usememo */
import { PostDetail } from "@/graphql/types";
import { sanitizeCmsHtml } from "@/lib/cms-html-sanitizer";
import { format } from "date-fns";
import Image from "next/image";
import Link from "@/components/link-base";
import { CiCalendar } from "react-icons/ci";
import { createTableOfContents } from "@/components/table-of-content/create-table-of-content";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import dynamic from "next/dynamic";

// Tiny SVG blur placeholder for post featured image
const POST_BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI5Ij48cmVjdCBmaWxsPSIjMWEzNjVkIiB3aWR0aD0iMTYiIGhlaWdodD0iOSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+";

const TableOfContentActiveHeading = dynamic(
  () => import("@/components/table-of-content/TableOfContentActiveHeading")
);

type Props = {
  post: PostDetail;
  basePath?: string; // "/blog" or "/news"
};

const tocStyle = {
  className: "flex w-full flex-col gap-3 rounded-lg bg-white px-4 py-2",
  contentClassName: "scrollbar-none overflow-y-auto",
};

function PostDetailNewView({ post, basePath = "/blog" }: Props) {
  const hasNumberingPrefix = post.content?.includes("<h2>1.") ?? false;
  const { content, toc } = createTableOfContents(post.content ?? "", {
    numberingPrefix: !hasNumberingPrefix,
  });

  const category = post.categories?.nodes?.[0];
  const breadcrumbLinks = [
    { name: "Trang chủ", href: "/" },
    {
      name: basePath === "/news" ? "Tin tức" : "Blog",
      href: `${basePath}/`,
    },
    { name: post.title, href: `${basePath}/${post.slug}/` },
  ];

  return (
    <>
      <div className="mx-auto flex h-auto w-full max-w-screen-xl flex-col gap-4 px-5 pb-4 md:px-10">
        <div className="mt-3 w-full">
          <Breadcrumbs links={breadcrumbLinks} hasBackground={false} />
        </div>

        {/* Post header */}
        <div className="flex w-full flex-col gap-3">
          <h1 className="text-2xl font-bold md:text-3xl">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <Link
                href={category.uri ?? `/category/${category.slug}/`}
                className="rounded bg-default-100 px-2 py-1 text-sm transition-colors hover:bg-primary hover:text-white"
              >
                {category.name}
              </Link>
            )}
            {post.tags?.nodes?.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tag/${tag.slug}/`}
                className="rounded bg-default-100 px-2 py-1 text-sm transition-colors hover:bg-primary hover:text-white"
              >
                {tag.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-default-500">
            {post.author?.node && (
              <span className="font-medium">{post.author.node.name}</span>
            )}
            {post.date && (
              <span className="flex items-center gap-1">
                <CiCalendar className="h-4 w-4" />
                {format(new Date(post.date), "dd/MM/yyyy")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-auto w-full max-w-screen-xl flex-col gap-4 pb-8 lg:px-10">
        <div className="flex w-full flex-col gap-6 lg:flex-row">
          {/* Main content */}
          <div className="flex w-full flex-col gap-6 lg:w-8/12">
            <div className="rounded-lg border border-white bg-white p-4 shadow-sm">
              {post.featuredImage?.node?.sourceUrl && (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={post.featuredImage.node.sourceUrl}
                    alt={
                      post.featuredImage.node.altText ||
                      post.featuredImage.node.title ||
                      post.title
                    }
                    width={750}
                    height={422}
                    className="h-full w-full rounded-lg object-cover"
                    unoptimized
                    priority
                    placeholder="blur"
                    blurDataURL={POST_BLUR_PLACEHOLDER}
                    sizes="(max-width: 1023px) 100vw, 750px"
                  />
                </div>
              )}
              <div
                className="post-detail flex w-full flex-col p-1"
                dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(content) }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="z-30 flex w-full flex-col gap-4 lg:w-4/12">
            <div className="sticky top-16 flex flex-col gap-4">
              <TableOfContentActiveHeading
                toc={toc}
                depth={5}
                style={tocStyle}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostDetailNewView;
