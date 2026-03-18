/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { setSeoData, wpURLtoNextURL } from "@/lib/utils";
import { getServerTranslation } from "@/services/i18n";
import { PageGroupEnvKeyEnum } from "@/services/infrastructure/wordpress/enums/page-group-env-key-enum";
import { getEnvPage } from "@/services/infrastructure/wordpress/queries/getEnvSettings";
import { WordpressPage } from "@/services/infrastructure/wordpress/types/page";
import type { Metadata } from "next";
import Booking from "./page-content";

type Props = {
  params: { language: string; id: string };
  searchParams: { [key: string]: string | undefined };
};

type Params = {
  slug: string; // Định nghĩa slug là một thuộc tính
  language: string; // Giữ thuộc tính language nếu cần thiết
};

type SeoProps = {
  params: Params; // Sử dụng kiểu Params cho props
  searchParams: Record<string, string | string[]>; // Có thể điều chỉnh tùy thuộc vào cấu trúc searchParams bạn cần
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page: WordpressPage | null = await getEnvPage(
    PageGroupEnvKeyEnum.BOOKING
  );
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  const { t } = await getServerTranslation(params.language, "booking");

  if (page) {
    if (page?.seo) {
      const metaData = setSeoData(page);
      return {
        ...metaData,
        alternates: {
          canonical: baseUrl + `/booking/${params.id}/`,
        },
        openGraph: {
          ...metaData.openGraph,
          url: baseUrl + `/booking/${params.id}/`,
        },
      } as Metadata;
    }

    return {
      // title,
      title: page?.seo.title,
      description: page?.seo.description,
      alternates: {
        canonical: baseUrl + `/booking/${params.id}/`,
      },
    } as Metadata;
  }

  return {
    title: t("title"),
  };
}

export default async function Page({ params, searchParams }: SeoProps) {
  const page: WordpressPage | null = await getEnvPage(
    PageGroupEnvKeyEnum.BOOKING
  );

  const termConditionPage: WordpressPage | null = await getEnvPage(
    PageGroupEnvKeyEnum.TERM_CONDITION
  );

  return (
    <>
      {/* Add JSON-LD to your page */}
      <div
        dangerouslySetInnerHTML={{
          __html: wpURLtoNextURL(page?.seo.jsonLd.raw ?? ""),
        }}
      />
      <Booking
        params={params}
        searchParams={searchParams}
        termsConditionPage={termConditionPage ?? undefined}
      />
    </>
  );
}
