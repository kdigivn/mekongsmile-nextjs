/* eslint-disable @arthurgeron/react-usememo/require-usememo */
/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { getServerTranslation } from "@/services/i18n";
import { Metadata } from "next";
import Transactions from "./page-content";
import { WordpressPage } from "@/services/infrastructure/wordpress/types/page";
import { setSeoData, wpURLtoNextURL } from "@/lib/utils";
import { PageGroupEnvKeyEnum } from "@/services/infrastructure/wordpress/enums/page-group-env-key-enum";
import { getEnvPage } from "@/services/infrastructure/wordpress/queries/getEnvSettings";

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | undefined };
};
export async function generateMetadata(): Promise<Metadata> {
  const page: WordpressPage | null = await getEnvPage(
    PageGroupEnvKeyEnum.TRANSACTIONS
  );
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  if (page) {
    if (page?.seo) {
      const metaData = setSeoData(page);
      return {
        ...metaData,
        alternates: {
          canonical: baseUrl + "/transactions/",
        },
        openGraph: {
          ...metaData.openGraph,
          url: baseUrl + "/transactions/",
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

  const { t } = await getServerTranslation("vi", "user/transastions");
  return {
    title: t("title"),
  };
}

export default async function Page({ params, searchParams }: Props) {
  const page: WordpressPage | null = await getEnvPage(
    PageGroupEnvKeyEnum.TRANSACTIONS
  );

  return (
    <>
      {/* Add JSON-LD to your page */}
      <div
        dangerouslySetInnerHTML={{
          __html: wpURLtoNextURL(page?.seo.jsonLd.raw ?? ""),
        }}
      />
      <Transactions params={params} searchParams={searchParams} />
    </>
  );
}
