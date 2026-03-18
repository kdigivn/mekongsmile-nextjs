import { useMemo } from "react";
import { WordpressPage } from "@/services/infrastructure/wordpress/types/page";
import { format } from "date-fns";
import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import { getBreadcrumbFromSEO, wpURLtoNextURL } from "@/lib/utils";
import { createTableOfContents } from "@/components/table-of-content/create-table-of-content";
// import TableOfContentActiveHeading from "@/components/table-of-content/TableOfContentActiveHeading";
import { CiCalendar } from "react-icons/ci";
import HeadingBase from "@/components/heading/heading-base";
import dynamic from "next/dynamic";

import Image from "next/image";

// Tiny SVG blur placeholder for page featured images
const PAGE_BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI5Ij48cmVjdCBmaWxsPSIjMWEzNjVkIiB3aWR0aD0iMTYiIGhlaWdodD0iOSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+";

type Props = {
  page: WordpressPage;
};

const TableOfContentActiveHeading = dynamic(
  () => import("@/components/table-of-content/TableOfContentActiveHeading"),
  {
    ssr: false,
  }
);

function DefaultPage({ page }: Props) {
  const hasNumberingPrefix = page.content?.includes("<h2>1.") ?? false;

  const { content, toc } = createTableOfContents(page.content, {
    numberingPrefix: !hasNumberingPrefix,
  });

  page.content = content;

  const tocStyle = useMemo(
    () => ({
      className:
        "flex w-full flex-col gap-3 rounded-lg bg-white px-4 py-2 mb-6",
      contentClassName: "scrollbar-none overflow-y-auto ",
    }),
    []
  );

  const thumbnail = page.featuredImage?.node?.sourceUrl;

  return (
    <>
      <div
        dangerouslySetInnerHTML={{
          __html: wpURLtoNextURL(page?.seo.jsonLd.raw ?? ""),
        }}
      />
      <div className="lg:px-auto m-auto flex h-auto w-full max-w-screen-xl flex-col items-center justify-center gap-4 px-5 pb-4 md:px-10">
        <Breadcrumbs links={getBreadcrumbFromSEO(page)} hasBackground={false} />
        <div className="flex-grow-1 flex flex-1 flex-col items-center gap-3">
          <div className="grid grid-cols-12 gap-4">
            <div className="z-20 col-span-12 mb-6 flex w-full flex-col items-start justify-center rounded-md border-1 border-white bg-white p-4 shadow-sm md:col-span-8">
              <div className="flex flex-col gap-1 pt-3">
                <HeadingBase headingTag="h1">{page.title}</HeadingBase>
                <div className="flex items-center gap-1 text-sm">
                  <CiCalendar className="h-5 w-5 text-left" />
                  {format(new Date(page.date), "d/MM/yyyy")}
                </div>
              </div>
              {thumbnail && (
                <div className="z-10 flex w-full overflow-hidden py-2">
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
              <div className="w-full">
                <div
                  className="post-detail p-1"
                  dangerouslySetInnerHTML={{
                    __html: page?.content ?? "",
                  }}
                ></div>
              </div>
            </div>

            <div className="z-30 col-span-12 flex w-full flex-col gap-4 md:col-span-4">
              <div className="sticky top-24 flex w-full flex-col gap-4">
                <TableOfContentActiveHeading
                  toc={toc}
                  depth={5}
                  style={tocStyle}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DefaultPage;
