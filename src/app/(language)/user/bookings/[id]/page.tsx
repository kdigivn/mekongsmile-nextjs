/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { getServerTranslation } from "@/services/i18n";
import { Metadata } from "next";
import UserBookingDetail from "./page-content";
import { checkAuth } from "@/server-actions/check";
import { redirect } from "next/navigation";
import { WordpressPage } from "@/services/infrastructure/wordpress/types/page";
import { setSeoData, wpURLtoNextURL } from "@/lib/utils";
import { PageGroupEnvKeyEnum } from "@/services/infrastructure/wordpress/enums/page-group-env-key-enum";
import { getEnvPage } from "@/services/infrastructure/wordpress/queries/getEnvSettings";

type Props = {
  params: { language: string; id: string };
};

type Params = {
  id: string; // Định nghĩa slug là một thuộc tính
  language: string; // Giữ thuộc tính language nếu cần thiết
  slug: string;
};

type SeoProps = {
  params: Params; // Sử dụng kiểu Params cho props
  searchParams: Record<string, string | string[]>; // Có thể điều chỉnh tùy thuộc vào cấu trúc searchParams bạn cần
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "user/bookings");

  const page: WordpressPage | null = await getEnvPage(
    PageGroupEnvKeyEnum.BOOKING
  );
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  if (page) {
    if (page?.seo) {
      const metaData = setSeoData(page);
      return {
        ...metaData,
        alternates: {
          canonical: baseUrl + `/user/bookings/${params.id}/`,
        },
        title: `${page?.seo.title} - ${params.id}`,
        openGraph: {
          ...metaData.openGraph,
          url: baseUrl + `/user/bookings/${params.id}/`,
          title: `${page?.seo.title} - ${params.id}`,
        },
      } as Metadata;
    }

    return {
      title: page?.seo.title,
      description: page?.seo.description,
      alternates: {
        canonical: baseUrl + `/user/bookings/${params.id}/`,
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

  const isLogin = await checkAuth();
  if (process.env.INTERNATIONAL_ROUTING_ENABLED === "true") {
    if (!params.id) {
      redirect(`/${params.language}`);
    }
    if (!isLogin) {
      redirect(
        `/${params.language}/sign-in?returnTo=/user/bookings/${params.id}`
      );
    }
  } else {
    if (!params.id) {
      redirect(`/`);
    }
    if (!isLogin) {
      redirect(`/sign-in?returnTo=/user/bookings/${params.id}`);
    }
  }

  return (
    <>
      <div
        dangerouslySetInnerHTML={{
          __html: wpURLtoNextURL(page?.seo.jsonLd.raw ?? ""),
        }}
      />
      <UserBookingDetail
        params={params}
        searchParams={searchParams}
        termsConditionPage={termConditionPage ?? undefined}
      />
    </>
  );
}
