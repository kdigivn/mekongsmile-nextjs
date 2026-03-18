/* eslint-disable @arthurgeron/react-usememo/require-usememo */
import { PageData } from "@/graphql/types";
import { sanitizeCmsHtml } from "@/lib/cms-html-sanitizer";
import { format } from "date-fns";
import Image from "next/image";
import { CiCalendar } from "react-icons/ci";
import { createTableOfContents } from "@/components/table-of-content/create-table-of-content";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import HeadingBase from "@/components/heading/heading-base";
import dynamic from "next/dynamic";

// Tiny SVG blur placeholder for page featured images
const PAGE_BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI5Ij48cmVjdCBmaWxsPSIjMWEzNjVkIiB3aWR0aD0iMTYiIGhlaWdodD0iOSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+";

const TableOfContentActiveHeading = dynamic(
  () => import("@/components/table-of-content/TableOfContentActiveHeading"),
  { ssr: false }
);

const tocStyle = {
  className: "flex w-full flex-col gap-3 rounded-lg bg-white px-4 py-2 mb-6",
  contentClassName: "scrollbar-none overflow-y-auto",
};

type Props = {
  page: PageData;
  breadcrumbLabel?: string;
};

function WpPageContentView({ page, breadcrumbLabel }: Props) {
  const hasNumberingPrefix = page.content?.includes("<h2>1.") ?? false;
  const { content, toc } = createTableOfContents(page.content ?? "", {
    numberingPrefix: !hasNumberingPrefix,
  });

  const breadcrumbLinks = [
    { name: "Trang chủ", href: "/" },
    {
      name: breadcrumbLabel || page.title,
      href: page.uri ?? `/${page.slug}/`,
    },
  ];

  const thumbnail = page.featuredImage?.node?.sourceUrl;

  return (
    <div className="mx-auto flex h-auto w-full max-w-screen-xl flex-col gap-4 px-5 pb-8 md:px-10">
      <Breadcrumbs links={breadcrumbLinks} hasBackground={false} />

      <div className="grid grid-cols-12 gap-4">
        {/* Main content */}
        <div className="z-20 col-span-12 flex w-full flex-col gap-4 rounded-md border border-white bg-white p-4 shadow-sm md:col-span-8">
          <div className="flex flex-col gap-1 pt-2">
            <HeadingBase headingTag="h1">{page.title}</HeadingBase>
            {page.date && (
              <div className="flex items-center gap-1 text-sm text-default-500">
                <CiCalendar className="h-5 w-5" />
                {format(new Date(page.date), "d/MM/yyyy")}
              </div>
            )}
          </div>

          {thumbnail && (
            <div className="overflow-hidden rounded-lg">
              <Image
                src={thumbnail}
                alt={page.title}
                className="aspect-video w-full rounded-md object-cover"
                loading="eager"
                priority
                unoptimized
                placeholder="blur"
                blurDataURL={PAGE_BLUR_PLACEHOLDER}
                width={800}
                height={540}
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 800px"
              />
            </div>
          )}

          <div
            className="post-detail w-full p-1"
            dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(content) }}
          />
        </div>

        {/* Sidebar with TOC */}
        <div className="z-30 col-span-12 flex w-full flex-col gap-4 md:col-span-4">
          <div className="sticky top-24 flex w-full flex-col gap-4">
            <TableOfContentActiveHeading toc={toc} depth={5} style={tocStyle} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default WpPageContentView;
