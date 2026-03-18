/* eslint-disable @arthurgeron/react-usememo/require-memo */
import EditProfile from "./page-content";
import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import { WordpressPage } from "@/services/infrastructure/wordpress/types/page";
import { getPageBySlug } from "@/services/infrastructure/wordpress/queries/getPages";
import { setSeoData, wpURLtoNextURL } from "@/lib/utils";

type Params = {
  slug: string; // Định nghĩa slug là một thuộc tính
  language: string; // Giữ thuộc tính language nếu cần thiết
};

type Props = {
  params: Params; // Sử dụng kiểu Params cho props
  searchParams: Record<string, string | string[]>; // Có thể điều chỉnh tùy thuộc vào cấu trúc searchParams bạn cần
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page: WordpressPage | null = await getPageBySlug("profile-edit");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  const { t } = await getServerTranslation(params.language, "profile");

  if (page) {
    if (page?.seo) {
      const metaData = setSeoData(page);
      return {
        ...metaData,
        alternates: {
          canonical: baseUrl + "/profile/edit/",
        },
        openGraph: {
          ...metaData.openGraph,
          url: baseUrl + "/profile/edit/",
        },
      } as Metadata;
    }

    return {
      // title,
      title: page?.seo.title,
      description: page?.seo.description,
      alternates: {
        canonical: baseUrl + "/" + page.slug,
      },
    } as Metadata;
  }

  return {
    title: t("title1"),
  };
}
export default async function Page({ params, searchParams }: Props) {
  const page: WordpressPage | null = await getPageBySlug("profile-edit");

  return (
    <>
      {/* Add JSON-LD to your page */}
      <div
        dangerouslySetInnerHTML={{
          __html: wpURLtoNextURL(page?.seo.jsonLd.raw ?? ""),
        }}
      />
      <EditProfile params={params} searchParams={searchParams} />
    </>
  );
}
